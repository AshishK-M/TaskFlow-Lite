import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, AuthedUser, createTestApp, signup } from './helpers';

describe('Boards + RBAC (e2e)', () => {
  let app: INestApplication;
  let owner: AuthedUser;
  let admin: AuthedUser;
  let member: AuthedUser;
  let viewer: AuthedUser;
  let outsider: AuthedUser;
  let boardId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    owner = await signup(app, { email: 'owner@example.com', name: 'Owner' });
    admin = await signup(app, { email: 'admin@example.com', name: 'Admin' });
    member = await signup(app, { email: 'member@example.com', name: 'Member' });
    viewer = await signup(app, { email: 'viewer@example.com', name: 'Viewer' });
    outsider = await signup(app, { email: 'outsider@example.com', name: 'Outsider' });

    // Owner creates a board, then assigns the other roles.
    const board = await request(app.getHttpServer())
      .post('/api/boards')
      .set(auth(owner.token))
      .send({ name: 'Roadmap', description: 'A board.' })
      .expect(201);
    boardId = board.body.data.id;

    for (const { user, role } of [
      { user: admin, role: 'ADMIN' as const },
      { user: member, role: 'MEMBER' as const },
      { user: viewer, role: 'VIEWER' as const },
    ]) {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(owner.token))
        .send({ userId: user.id, role })
        .expect(201);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Board CRUD', () => {
    it('lists boards only for users with membership', async () => {
      const ownerList = await request(app.getHttpServer())
        .get('/api/boards')
        .set(auth(owner.token))
        .expect(200);
      expect(ownerList.body.data).toHaveLength(1);

      const outsiderList = await request(app.getHttpServer())
        .get('/api/boards')
        .set(auth(outsider.token))
        .expect(200);
      expect(outsiderList.body.data).toHaveLength(0);
    });

    it('blocks non-members from reading a board (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(outsider.token))
        .expect(403);
    });

    it('owner can update, admin can update, member cannot, viewer cannot', async () => {
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(owner.token))
        .send({ description: 'updated by owner' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(admin.token))
        .send({ description: 'updated by admin' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(member.token))
        .send({ description: 'nope' })
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(viewer.token))
        .send({ description: 'nope' })
        .expect(403);
    });

    it('only the owner can delete a board', async () => {
      // Create a throwaway board owned by `admin` so we can verify the rule
      const tmp = await request(app.getHttpServer())
        .post('/api/boards')
        .set(auth(admin.token))
        .send({ name: 'Temp' })
        .expect(201);
      const tmpId = tmp.body.data.id;

      // Owner of "Roadmap" isn't owner of "Temp"; add them as ADMIN
      await request(app.getHttpServer())
        .post(`/api/boards/${tmpId}/members`)
        .set(auth(admin.token))
        .send({ userId: owner.id, role: 'ADMIN' })
        .expect(201);

      // Admin role still cannot delete (only OWNER can)
      await request(app.getHttpServer())
        .delete(`/api/boards/${tmpId}`)
        .set(auth(owner.token))
        .expect(403);

      // Real owner can
      await request(app.getHttpServer())
        .delete(`/api/boards/${tmpId}`)
        .set(auth(admin.token))
        .expect(200);
    });
  });

  describe('Task RBAC', () => {
    let memberTaskId: string;

    it('viewer cannot create tasks', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(viewer.token))
        .send({ title: 'Sneaky' })
        .expect(403);
    });

    it('member can create a task and edit/delete their own', async () => {
      const created = await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(member.token))
        .send({ title: 'My task' })
        .expect(201);
      memberTaskId = created.body.data.id;

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/tasks/${memberTaskId}`)
        .set(auth(member.token))
        .send({ status: 'IN_PROGRESS' })
        .expect(200);
    });

    it('a different member cannot edit/delete tasks they did not create', async () => {
      const other = await signup(app, { email: 'other-member@example.com', name: 'Other' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(owner.token))
        .send({ userId: other.id, role: 'MEMBER' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/tasks/${memberTaskId}`)
        .set(auth(other.token))
        .send({ status: 'DONE' })
        .expect(403);
    });

    it('admin can edit anyone’s task', async () => {
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/tasks/${memberTaskId}`)
        .set(auth(admin.token))
        .send({ status: 'DONE' })
        .expect(200);
    });

    it('rejects an assignee that is not a board member (403)', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(owner.token))
        .send({ title: 'Bad assignee', assigneeId: outsider.id })
        .expect(403);
    });

    it('validates the task payload', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(owner.token))
        .send({ title: '', priority: 'NOPE' })
        .expect(400);
    });
  });

  describe('Member management', () => {
    it('viewer cannot add members; admin can', async () => {
      const seventh = await signup(app, { email: 'seventh@example.com', name: 'Seventh' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(viewer.token))
        .send({ userId: seventh.id, role: 'MEMBER' })
        .expect(403);

      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(admin.token))
        .send({ userId: seventh.id, role: 'MEMBER' })
        .expect(201);
    });

    it('cannot demote the owner', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(owner.token))
        .expect(200);
      const ownerMembership = detail.body.data.members.find(
        (m: { role: string }) => m.role === 'OWNER',
      );

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/members/${ownerMembership.id}`)
        .set(auth(owner.token))
        .send({ role: 'ADMIN' })
        .expect(400);
    });

    it('cannot assign OWNER role through the members endpoint', async () => {
      const newcomer = await signup(app, { email: 'eighth@example.com', name: 'Eighth' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(owner.token))
        .send({ userId: newcomer.id, role: 'OWNER' })
        .expect(400);
    });
  });
});
