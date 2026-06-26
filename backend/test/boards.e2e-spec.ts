import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, AuthedUser, createTestApp, signup } from './helpers';

describe('Boards + RBAC (e2e)', () => {
  let app: INestApplication;
  let owner: AuthedUser;
  let editor: AuthedUser;
  let viewer: AuthedUser;
  let outsider: AuthedUser;
  let boardId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    owner = await signup(app, { email: 'owner@example.com', name: 'Owner' });
    editor = await signup(app, { email: 'editor@example.com', name: 'Editor' });
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
      { user: editor, role: 'EDITOR' as const },
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
    it('any authenticated user can create their own board', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/boards')
        .set(auth(outsider.token))
        .send({ name: 'Outsider board' })
        .expect(201);
      expect(res.body.data.ownerId).toBe(outsider.id);

      // Clean up so other tests stay accurate
      await request(app.getHttpServer())
        .delete(`/api/boards/${res.body.data.id}`)
        .set(auth(outsider.token))
        .expect(200);
    });

    it('lists boards only for users with membership', async () => {
      const ownerList = await request(app.getHttpServer())
        .get('/api/boards')
        .set(auth(owner.token))
        .expect(200);
      expect(ownerList.body.data).toHaveLength(1);

      const editorList = await request(app.getHttpServer())
        .get('/api/boards')
        .set(auth(editor.token))
        .expect(200);
      expect(editorList.body.data).toHaveLength(1);

      const outsiderList = await request(app.getHttpServer())
        .get('/api/boards')
        .set(auth(outsider.token))
        .expect(200);
      expect(outsiderList.body.data).toHaveLength(0);
    });

    it('all three roles can read the board they belong to', async () => {
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(owner.token))
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(editor.token))
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(viewer.token))
        .expect(200);
    });

    it('blocks non-members from reading a board (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(outsider.token))
        .expect(403);
    });

    it('only owner can update board metadata; editor and viewer cannot', async () => {
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(owner.token))
        .send({ description: 'updated by owner' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(editor.token))
        .send({ description: 'nope' })
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}`)
        .set(auth(viewer.token))
        .send({ description: 'nope' })
        .expect(403);
    });

    it('only the owner can delete a board', async () => {
      // Create a throwaway board owned by `editor` so we can verify the rule
      const tmp = await request(app.getHttpServer())
        .post('/api/boards')
        .set(auth(editor.token))
        .send({ name: 'Temp' })
        .expect(201);
      const tmpId = tmp.body.data.id;

      // Add the other user as EDITOR on the new board
      await request(app.getHttpServer())
        .post(`/api/boards/${tmpId}/members`)
        .set(auth(editor.token))
        .send({ userId: owner.id, role: 'EDITOR' })
        .expect(201);

      // Editor on this board cannot delete it
      await request(app.getHttpServer())
        .delete(`/api/boards/${tmpId}`)
        .set(auth(owner.token))
        .expect(403);

      // Real owner of this board can
      await request(app.getHttpServer())
        .delete(`/api/boards/${tmpId}`)
        .set(auth(editor.token))
        .expect(200);
    });
  });

  describe('Task RBAC', () => {
    let taskId: string;

    it('viewer cannot create tasks', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(viewer.token))
        .send({ title: 'Sneaky' })
        .expect(403);
    });

    it('owner can create a task', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(owner.token))
        .send({ title: 'Owner task' })
        .expect(201);
      taskId = res.body.data.id;
    });

    it('editor can create, update, and delete any task', async () => {
      const created = await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/tasks`)
        .set(auth(editor.token))
        .send({ title: 'Editor task' })
        .expect(201);
      const editorTaskId = created.body.data.id;

      // Editor can update the task they didn't create (owner's task)
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/tasks/${taskId}`)
        .set(auth(editor.token))
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      // And delete their own
      await request(app.getHttpServer())
        .delete(`/api/boards/${boardId}/tasks/${editorTaskId}`)
        .set(auth(editor.token))
        .expect(200);
    });

    it('viewer cannot update or delete tasks', async () => {
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/tasks/${taskId}`)
        .set(auth(viewer.token))
        .send({ status: 'DONE' })
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/api/boards/${boardId}/tasks/${taskId}`)
        .set(auth(viewer.token))
        .expect(403);
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

  describe('Member management — owner only', () => {
    it('viewer cannot add members', async () => {
      const u = await signup(app, { email: 'a-viewer-target@example.com', name: 'Target One' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(viewer.token))
        .send({ userId: u.id, role: 'EDITOR' })
        .expect(403);
    });

    it('editor cannot add members', async () => {
      const u = await signup(app, { email: 'a-editor-target@example.com', name: 'Target Two' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(editor.token))
        .send({ userId: u.id, role: 'VIEWER' })
        .expect(403);
    });

    it('owner can add members', async () => {
      const u = await signup(app, { email: 'an-owner-target@example.com', name: 'Target Three' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(owner.token))
        .send({ userId: u.id, role: 'EDITOR' })
        .expect(201);
    });

    it('editor and viewer cannot change member roles', async () => {
      const detail = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}`)
        .set(auth(owner.token))
        .expect(200);
      const editorMembership = detail.body.data.members.find(
        (m: { role: string }) => m.role === 'EDITOR',
      );
      const viewerMembership = detail.body.data.members.find(
        (m: { role: string }) => m.role === 'VIEWER',
      );

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/members/${viewerMembership.id}`)
        .set(auth(editor.token))
        .send({ role: 'EDITOR' })
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/members/${editorMembership.id}`)
        .set(auth(viewer.token))
        .send({ role: 'VIEWER' })
        .expect(403);
    });

    it('owner cannot demote themselves through the members endpoint', async () => {
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
        .send({ role: 'EDITOR' })
        .expect(400);
    });

    it('cannot assign OWNER role through the members endpoint', async () => {
      const newcomer = await signup(app, { email: 'owner-target@example.com', name: 'Eighth' });
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/members`)
        .set(auth(owner.token))
        .send({ userId: newcomer.id, role: 'OWNER' })
        .expect(400);
    });
  });
});
