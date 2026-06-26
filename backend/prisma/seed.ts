import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'password123';

const users = [
  { email: 'alice@example.com', name: 'Alice (owner)' },
  { email: 'bob@example.com', name: 'Bob (editor)' },
  { email: 'carol@example.com', name: 'Carol (viewer)' },
];

const main = async () => {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  const [alice, bob, carol] = await Promise.all(
    users.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { email: u.email, name: u.name, password },
      }),
    ),
  );

  const board = await prisma.board.upsert({
    where: { id: 'seed-board-id' },
    update: {},
    create: {
      id: 'seed-board-id',
      name: 'Q3 Product Launch',
      description: 'Track our launch milestones here.',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: bob.id, role: 'EDITOR' },
          { userId: carol.id, role: 'VIEWER' },
        ],
      },
    },
  });

  await prisma.task.deleteMany({ where: { boardId: board.id } });
  await prisma.task.createMany({
    data: [
      {
        boardId: board.id,
        title: 'Finalise launch checklist',
        description: 'Coordinate with marketing on Day-1 messaging.',
        status: 'TODO',
        priority: 'HIGH',
        createdById: alice.id,
        assigneeId: alice.id,
      },
      {
        boardId: board.id,
        title: 'Wire up analytics dashboard',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        createdById: bob.id,
        assigneeId: bob.id,
      },
      {
        boardId: board.id,
        title: 'Sign off legal review',
        status: 'DONE',
        priority: 'LOW',
        createdById: alice.id,
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log(`Seed complete. Users: ${users.map((u) => u.email).join(', ')} (password: ${SEED_PASSWORD})`);
};

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
