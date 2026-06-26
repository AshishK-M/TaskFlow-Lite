import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_DB_PATH = join(__dirname, '..', 'prisma', 'test.db');

let migrationsApplied = false;

export const resetDatabase = async (): Promise<void> => {
  // Drop and re-create the test SQLite file once per process so the schema is
  // guaranteed to match prisma/schema.prisma.
  if (!migrationsApplied) {
    if (existsSync(TEST_DB_PATH)) rmSync(TEST_DB_PATH);
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: join(__dirname, '..'),
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });
    migrationsApplied = true;
  }
};

export const createTestApp = async (): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> => {
  await resetDatabase();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  // Only the pipe is configured outside of AppModule (matches main.ts). The
  // global filter and response interceptor are wired via APP_FILTER /
  // APP_INTERCEPTOR providers, so re-registering them here would double-wrap.
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  await app.init();

  const prisma = app.get(PrismaService);
  await prisma.task.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  return { app, prisma };
};

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  token: string;
};

export const signup = async (
  app: INestApplication,
  overrides: { email: string; name?: string; password?: string },
): Promise<AuthedUser> => {
  const res = await request(app.getHttpServer())
    .post('/api/auth/signup')
    .send({
      email: overrides.email,
      name: overrides.name ?? overrides.email.split('@')[0],
      password: overrides.password ?? 'password123',
    })
    .expect(201);
  expect(res.body.success).toBe(true);
  return { ...res.body.data.user, token: res.body.data.token };
};

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
