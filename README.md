# Kanban - Full-Stack MVP

A production-quality Kanban / project-management app with boards, tasks (`TODO` / `IN_PROGRESS` / `DONE`), members with role-based access, JWT auth, and automated tests.

Built as a take-home assessment. The brief asked for a senior-level, maintainable codebase: clean architecture, reusable UI, no duplicated business logic, and thoughtful defaults. The sections below explain what is where and why.

---

## Stack

| Layer | Tech |
| --- | --- |
| Backend | NestJS 10, Prisma 5, SQLite, JWT, Passport, class-validator, Jest |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind, React Hook Form, Zod, Axios |
| Tooling | TypeScript strict, CVA, tailwind-merge, helmet, `@nestjs/throttler` |

---

## Quick Start

```bash
# 1. Backend
cd backend
npm install
npx prisma migrate dev --name init   # creates dev.db
npm run prisma:seed                  # optional: 3 demo users + sample board
npm run start:dev                    # http://localhost:4000/api

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                          # http://localhost:3000
```

Seeded accounts (all use password `password123`):

| Email | Role on Demo Board |
| --- | --- |
| `alice@example.com` | OWNER |
| `bob@example.com` | EDITOR |
| `carol@example.com` | VIEWER |

---

## Environment Variables

### `backend/.env`

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Any Prisma-supported URL |
| `JWT_SECRET` | required | Change in production |
| `JWT_EXPIRES_IN` | `7d` | Standard `jsonwebtoken` format |
| `PORT` | `4000` | |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin |

### `frontend/.env.local`

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` |

---

## Folder Structure

```text
backend/
  prisma/
    schema.prisma                  # User, Board, BoardMember, Task
    seed.ts                        # demo users + board
  src/
    main.ts                        # bootstrap: helmet, CORS, body limit, validation pipe
    app.module.ts                  # global guards/filters/interceptors, throttler
    common/
      constants/                   # ROLES, TASK_STATUS, TASK_PRIORITY - single source of truth
      decorators/                  # @CurrentUser(), @Public()
      filters/                     # AllExceptionsFilter -> uniform error envelope
      guards/                      # JwtAuthGuard (skipped for @Public routes)
      interceptors/                # ResponseInterceptor -> uniform success envelope
      types/                       # JwtPayload, AuthenticatedUser
      utils/permissions.util.ts    # all role/ownership checks live here
    prisma/                        # Prisma module + service
    auth/                          # signup/login/me + JWT strategy
    users/                         # user search (for member-add typeahead)
    boards/                        # boards + MembershipService (re-used by tasks and members)
    tasks/                         # tasks scoped by /boards/:boardId/tasks
    members/                       # board members scoped by /boards/:boardId/members
  test/
    helpers.ts                     # bootstraps a NestJS test app on test.db
    auth.e2e-spec.ts               # 6 tests
    boards.e2e-spec.ts             # 13 tests covering RBAC + CRUD + member rules

frontend/
  app/
    layout.tsx                     # mounts AppProviders
    (auth)/login, signup           # auth pages - public
    (dashboard)/layout.tsx         # AuthGate + Navbar
    (dashboard)/boards             # list + [id]/page.tsx
  components/
    ui/                            # Button, Input, Textarea, Select, Avatar, Badge, Card,
                                   # Modal, ConfirmModal, Dropdown, Spinner, Skeleton,
                                   # EmptyState, ErrorState, Toast, Tabs
    layout/                        # PageContainer, Navbar, SectionHeader, AuthGate
    forms/                         # FormField, FormInput, FormTextarea, FormSelect, FormError
    auth/                          # AuthShell + shared Zod schemas
    boards/                        # BoardCard, BoardHeader, BoardForm, BoardFormModal
    tasks/                         # TaskCard, TaskColumn, TaskBoard, TaskForm,
                                   # TaskFormModal, StatusBadge, PriorityBadge,
                                   # StatusFilter, BoardTasksPanel
    members/                       # MemberRow, MemberList, RoleBadge, AddMemberModal,
                                   # BoardMembersPanel
  hooks/                           # useAuth, useBoards, useBoard, useTasks, useMembers,
                                   # useAsyncResource (generic, powers the data hooks),
                                   # useModal, useToast, useDebounce, usePermissions,
                                   # useApiErrorToast
  services/                        # auth.service, board.service, task.service, member.service
  providers/                       # AuthProvider, ToastProvider, AppProviders
  lib/                             # api (axios instance), cn, storage
  constants/                       # roles, status, routes, api, messages, validation
  types/                           # auth, board, task, member, api
  utils/                           # formatDate, getInitials, truncateText, statusColor, permissions
```

### Why This Shape

- Backend feature modules keep each domain responsible for its controller, service, and DTOs. Cross-domain primitives such as permission rules, role constants, and the response shape live in `common/`.
- `MembershipService` is the single place that resolves a user's role on a board. Both tasks and members reuse it instead of re-implementing role lookup.
- Frontend UI primitives live under `components/ui/` so forms, modals, badges, and layout pieces stay consistent and reusable.
- `useAsyncResource` centralizes loading, error, refetch, and async state handling once, while `useBoards`, `useBoard`, `useTasks`, and `useMembers` stay thin.
- `frontend/lib/api.ts` is the only Axios entry point. It attaches the bearer token, unwraps the `{ success, data }` envelope, and handles `401` logout behavior.
- Permissions exist on both sides with matching predicate names. The backend is the actual security boundary; the frontend uses them only to hide actions.

---

## Authentication

- `POST /api/auth/signup` and `POST /api/auth/login` return `{ user, token }`.
- `JwtAuthGuard` is global, so routes are protected by default. Public routes opt out via `@Public()`.
- Passwords are hashed with `bcryptjs` using 10 rounds.
- The frontend stores the token in `localStorage` and sends it through an Axios interceptor.

---

## Role-Based Access Control

The application has **exactly three board roles**: `OWNER`, `EDITOR`, `VIEWER`.

| Capability | OWNER | EDITOR | VIEWER |
| --- | :---: | :---: | :---: |
| View board | Yes | Yes | Yes |
| View tasks | Yes | Yes | Yes |
| Create task | Yes | Yes | No |
| Update task | Yes | Yes | No |
| Delete task | Yes | Yes | No |
| Manage board members | Yes | No | No |
| Update board | Yes | No | No |
| Delete board | Yes | No | No |
| Create a new board (becomes its OWNER) | Yes | Yes | Yes |

`OWNER`, `EDITOR`, `VIEWER` are the only valid role values. The backend's `class-validator` rejects any other value with HTTP 400.

Predicates live in one file per side and every authorisation check uses them — there are no inline role comparisons elsewhere in the codebase:

- Backend: `backend/src/common/utils/permissions.util.ts` — `canViewBoard`, `canViewTask`, `canCreateTask`, `canUpdateTask`, `canDeleteTask`, `canManageMembers`, `canUpdateBoard`, `canDeleteBoard`.
- Frontend: `frontend/utils/permissions.ts` — same names, exposed to React through `usePermissions(role)`.

**Member endpoint rules**

- Only `OWNER` can add members, remove members, or change a member's role.
- Assignable roles via the members endpoint are `EDITOR` and `VIEWER` — `OWNER` cannot be granted this way.
- `OWNER` is established at board creation and is immutable; the owner cannot be demoted or removed through the members endpoint.

---

## API Overview

All routes are prefixed with `/api`. All non-public routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Throttled 10/min |
| POST | `/auth/login` | No | Throttled 10/min |
| GET | `/auth/me` | Yes | Current user |
| GET | `/users/search?q=` | Yes | For member-add typeahead |
| GET | `/boards` | Yes | Lists boards the user belongs to |
| POST | `/boards` | Yes | Creator becomes OWNER |
| GET | `/boards/:id` | Yes | Membership required |
| PATCH | `/boards/:id` | Yes | OWNER only |
| DELETE | `/boards/:id` | Yes | OWNER only |
| GET | `/boards/:id/tasks` | Yes | Any member |
| POST | `/boards/:id/tasks` | Yes | OWNER or EDITOR |
| PATCH | `/boards/:id/tasks/:taskId` | Yes | OWNER or EDITOR |
| DELETE | `/boards/:id/tasks/:taskId` | Yes | OWNER or EDITOR |
| GET | `/boards/:id/members` | Yes | Any member |
| POST | `/boards/:id/members` | Yes | OWNER only |
| PATCH | `/boards/:id/members/:memberId` | Yes | OWNER only |
| DELETE | `/boards/:id/members/:memberId` | Yes | OWNER only |

Successful responses use:

```json
{ "success": true, "data": "<payload>" }
```

Error responses use:

```json
{
  "success": false,
  "error": { "message": "message", "statusCode": 400, "details": [] },
  "path": "/api/example"
}
```

---

## Testing

```bash
cd backend
npm run test:e2e
```

The backend includes 24 end-to-end tests against an isolated `test.db` SQLite database that is rebuilt for each test run.

Coverage includes:

- **Auth (6)** — signup, duplicate email 409, payload validation 400, login success/failure, `GET /auth/me`, unauthenticated request returns 401.
- **Boards (6)** — any authenticated user can create their own board, list filtering by membership, all three roles can read their boards, non-members get 403, only OWNER updates board metadata, only OWNER deletes a board.
- **Tasks (6)** — viewer cannot create / update / delete; owner can create; editor can create / update / delete any task on the board; invalid assignee rejected (403); payload validation (400).
- **Members (6)** — viewer cannot manage members, editor cannot manage members, owner can add members, role changes require OWNER, owner cannot demote themselves, OWNER role cannot be assigned via the members endpoint.

---

## Security

- `helmet` for baseline security headers.
- `@nestjs/throttler` with a global rate limit and stricter auth-route throttling.
- Request body size capped at 100 KB.
- `ValidationPipe` with whitelist, forbid-non-whitelisted, and transform enabled.
- Password hashing with `bcryptjs`.
- JWT payload contains only `sub` and `email`.
- CORS restricted by `CORS_ORIGIN`.
- Prisma is the only database access path.
- Authorization flows through `MembershipService.resolveRole()` and shared permission predicates.

---

## Tradeoffs

- SQLite via Prisma was chosen for a zero-setup MVP. The relational model still maps cleanly to PostgreSQL later.
- REST is the right abstraction level here; the domain surface is small and predictable.
- Drag-and-drop is intentionally omitted. Status changes can be implemented later on top of the existing task update API.
- Task updates are not optimistic yet; the UI waits for API confirmation.
- Realtime collaboration, password reset, and email verification are intentionally out of MVP scope.

---

## Scaling to 100k Users

If this grew beyond MVP scale, the path would be:

1. Move from SQLite to PostgreSQL.
2. Add Redis-backed caching for hot board and task reads.
3. Push notifications and long-running work to a queue such as BullMQ.
4. Add realtime collaboration through a Nest WebSocket gateway.
5. Scale the stateless API horizontally behind a load balancer.
6. Serve frontend assets and future uploads through a CDN-backed setup.
7. Add structured logging, metrics, tracing, and error tracking.
8. Replace in-memory throttling with Redis-backed throttling for multi-pod deployments.
9. Introduce organizations as the top-level tenancy boundary if the product evolves that way.

---

## What I Would Do Next

1. Add drag-and-drop task moves with optimistic UI.
2. Add richer search and filtering.
3. Add a per-board activity log.
4. Add email verification and password reset flows.
5. Add frontend tests.
6. Add CI for typecheck and e2e coverage.

---

## Scripts Cheat Sheet

```bash
# Backend
npm run start:dev
npm run build
npm run start:prod
npm run prisma:migrate
npm run prisma:seed
npm run test:e2e

# Frontend
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```
