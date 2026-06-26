import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, createTestApp, signup } from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user and returns a token', async () => {
    const user = await signup(app, { email: 'alice@example.com', name: 'Alice' });
    expect(user.id).toBeTruthy();
    expect(user.token).toBeTruthy();
    expect(user).not.toHaveProperty('password');
  });

  it('rejects duplicate emails with 409', async () => {
    await signup(app, { email: 'dup@example.com' });
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'dup@example.com', name: 'Dup', password: 'password123' })
      .expect(409);
    expect(res.body.error.message).toMatch(/already registered/i);
  });

  it('validates signup payloads', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', name: 'x', password: '123' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('logs in with correct credentials and rejects bad ones', async () => {
    await signup(app, { email: 'login@example.com' });
    const ok = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })
      .expect(200);
    expect(ok.body.data.token).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the current user from /auth/me when authenticated', async () => {
    const user = await signup(app, { email: 'me@example.com', name: 'Me' });
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set(auth(user.token))
      .expect(200);
    expect(res.body.data.email).toBe('me@example.com');
  });

  it('rejects unauthenticated requests with 401', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });
});
