# Kanban — Full-Stack MVP

A production-quality Kanban / project-management app: boards, tasks (TODO / IN_PROGRESS / DONE), members with role-based access, JWT auth, automated tests.

Built as a take-home assessment. The brief asked for a senior-level, maintainable codebase — clean architecture, reusable UI, no duplicated business logic, thoughtful defaults. The points below explain what's where and why.

---

## Stack

| Layer       | Tech                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| Backend     | NestJS 10 · Prisma 5 · SQLite · JWT · Passport · class-validator · Jest |
| Frontend    | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · React Hook Form · Zod · Axios |
| Tooling     | TypeScript strict · CVA · tailwind-merge · helmet · @nestjs/throttler   |

---

## Quick start

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

Seeded accounts (all password `password123`):

| Email                | Role on demo board |
| -------------------- | ------------------ |
| `alice@example.com`  | OWNER              |
| `bob@example.com`    | MEMBER             |
| `carol@example.com`  | VIEWER             |

---

## Environment variables

### `backend/.env`

| Variable          | Default                  | Notes                                       |
| ----------------- | ------------------------ | ------------------------------------------- |
| `DATABASE_URL`    | `file:./dev.db`          | Any Prisma-supported URL                    |
| `JWT_SECRET`      | _required_               | Change in production                        |
| `JWT_EXPIRES_IN`  | `7d`                     | Standard jsonwebtoken format                |
| `PORT`            | `4000`                   |                                             |
| `CORS_ORIGIN`     | `http://localhost:3000`  | Frontend origin                             |

### `frontend/.env.local`

| Variable               | Default                          |
| ---------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:4000/api`      |

---

## Folder structure

```
backend/
  prisma/
    schema.prisma                  # User, Board, BoardMember, Task
    seed.ts                        # demo users + board
  src/
    main.ts                        # bootstrap: helmet, CORS, body limit, validation pipe
    app.module.ts                  # global guards/filters/interceptors, throttler
    common/
      constants/                   # ROLES, TASK_STATUS, TASK_PRIORITY — single source of truth
      decorators/                  # @CurrentUser(), @Public()
      filters/                     # AllExceptionsFilter → uniform error envelope
      guards/                      # JwtAuthGuard (skipped for @Public routes)
      interceptors/                # ResponseInterceptor → uniform success envelope
      types/                       # JwtPayload, AuthenticatedUser
      utils/permissions.util.ts    # ALL role/ownership checks live here
    prisma/                        # Prisma module + service
    auth/                          # signup/login/me + JWT strategy
    users/                         # user search (for member-add typeahead)
    boards/                        # boards + MembershipService (re-used by tasks & members)
    tasks/                         # tasks scoped by /boards/:boardId/tasks
    members/                       # board members scoped by /boards/:boardId/members
  test/
    helpers.ts                     # bootstraps a NestJS test app on test.db
    auth.e2e-spec.ts               # 6 tests
    boards.e2e-spec.ts             # 13 tests covering RBAC + CRUD + member rules

frontend/
  app/
    layout.tsx                     # mounts AppProviders
    (auth)/login, signup           # auth pages — public
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
                                   # useApiAction (toast-wrapping action helper)
  services/                        # auth.service, board.service, task.service, member.service
  providers/                       # AuthProvider, ToastProvider, AppProviders
  lib/                             # api (axios instance), cn, storage
  constants/                       # roles, status, routes, api, messages, validation
  types/                           # auth, board, task, member, api
  utils/                           # formatDate, getInitials, truncateText, statusColor, permissions
```

### Why this shape

* **Feature modules on the backend** — each domain (boards, tasks, members) owns its controller, service, DTOs. Cross-domain primitives (permission rules, role constants, error shape) live in `common/`. `MembershipService` is the single place that resolves a user's role on a board; Tasks and Members both inject it.
* **Reusable UI library on the frontend** — `components/ui/` is built with CVA so variants are consistent. Forms compose `FormField + Input/Textarea/Select`; modals always wrap the same `Modal` primitive (`ConfirmModal`, `BoardFormModal`, `TaskFormModal`, `AddMemberModal`).
* **One generic data hook** — `useAsyncResource` handles loading / error / refetch / optimistic-update plumbing once; `useBoards`, `useBoard`, `useTasks`, `useMembers` are 30-line specialisations.
* **One centralised Axios** — `lib/api.ts` adds the bearer token, unwraps the `{success, data}` envelope, and force-logouts on 401. React components never import axios directly.
* **One permission module per side** — `backend/src/common/utils/permissions.util.ts` and `frontend/utils/permissions.ts` have the same predicate names. The backend version is the security boundary; the frontend version is only used to hide actions the user can't perform.

---

## Authentication

* `POST /api/auth/signup` and `POST /api/auth/login` return `{ user, token }`. Token is a JWT signed with `JWT_SECRET`.
* `JwtAuthGuard` is registered globally; routes are protected by default. Public routes opt out with `@Public()`.
* Passwords are hashed with `bcryptjs` (10 rounds). The hash is never returned in any response.
* Frontend stores `token` in `localStorage` and attaches it via Axios request interceptor. On 401 the interceptor clears the token and bounces to `/login`.

---

## Role-based access control

Roles per board: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`.

| Capability        | OWNER | ADMIN | MEMBER       | VIEWER |
| ----------------- | :---: | :---: | :----------: | :----: |
| Read board / tasks |  ✅   |  ✅   |     ✅       |   ✅   |
| Create task       |  ✅   |  ✅   |     ✅       |   ❌   |
| Update task       |  ✅   |  ✅   | own tasks    |   ❌   |
| Delete task       |  ✅   |  ✅   | own tasks    |   ❌   |
| Manage members    |  ✅   |  ✅   |     ❌       |   ❌   |
| Update board      |  ✅   |  ✅   |     ❌       |   ❌   |
| Delete board      |  ✅   |  ❌   |     ❌       |   ❌   |

Predicates live in **one file per side** and are used everywhere:
* Backend — `backend/src/common/utils/permissions.util.ts`. Services call `Permissions.canX({ role, isOwner })` after `MembershipService.resolveRole(boardId, userId)`.
* Frontend — `frontend/utils/permissions.ts`, surfaced via the `usePermissions(role)` hook. Pages call e.g. `can.createTask()` to decide whether to render the New-task button.

`OWNER` cannot be assigned or revoked through the members endpoint — the role is established at board creation and is immutable.

---

## API overview

All routes are prefixed `/api`. All non-public routes require `Authorization: Bearer <token>`.

| Method | Path                                          | Auth | Notes                                |
| ------ | --------------------------------------------- | ---- | ------------------------------------ |
| POST   | `/auth/signup`                                | —    | Throttled 10/min                     |
| POST   | `/auth/login`                                 | —    | Throttled 10/min                     |
| GET    | `/auth/me`                                    | ✅   | Current user                         |
| GET    | `/users/search?q=`                            | ✅   | For member-add typeahead             |
| GET    | `/boards`                                     | ✅   | Lists boards the user is a member of |
| POST   | `/boards`                                     | ✅   | Creator becomes OWNER                |
| GET    | `/boards/:id`                                 | ✅   | Membership required                  |
| PATCH  | `/boards/:id`                                 | ✅   | ADMIN+                               |
| DELETE | `/boards/:id`                                 | ✅   | OWNER only                           |
| GET    | `/boards/:id/tasks`                           | ✅   |                                      |
| POST   | `/boards/:id/tasks`                           | ✅   | MEMBER+                              |
| PATCH  | `/boards/:id/tasks/:taskId`                   | ✅   | ADMIN+, or MEMBER author             |
| DELETE | `/boards/:id/tasks/:taskId`                   | ✅   | ADMIN+, or MEMBER author             |
| GET    | `/boards/:id/members`                         | ✅   |                                      |
| POST   | `/boards/:id/members`                         | ✅   | ADMIN+                               |
| PATCH  | `/boards/:id/members/:memberId`               | ✅   | ADMIN+                               |
| DELETE | `/boards/:id/members/:memberId`               | ✅   | ADMIN+                               |

**Response envelope** — every successful response is `{ "success": true, "data": <payload> }`. Errors are `{ "success": false, "error": { "message", "statusCode", "details?" }, "path" }`. The frontend Axios interceptor unwraps the success envelope so service callers receive bare data.

---

## Testing

```bash
cd backend
npm run test:e2e
```

19 end-to-end tests run against an isolated `test.db` SQLite file (rebuilt every test run via `prisma db push`). Coverage:

* **Auth (6)** — signup happy path; duplicate email 409; payload validation 400; login good/bad credentials; `GET /auth/me`; 401 for unauthenticated requests.
* **Boards (4)** — list filtering by membership; 403 for non-members; ADMIN/OWNER can update; MEMBER/VIEWER cannot; only OWNER can delete.
* **Tasks (5)** — VIEWER cannot create; MEMBER can create/edit/delete *own* tasks; another MEMBER cannot edit someone else's; ADMIN can edit anyone's; non-member assignee rejected; payload validation.
* **Members (3)** — VIEWER cannot add members; ADMIN can; OWNER's role cannot be changed; OWNER role cannot be assigned via members endpoint.

The throttler ceiling is raised in test mode so back-to-back requests don't trip the rate limit.

---

## Security

* `helmet` — sane default security headers.
* `@nestjs/throttler` — 100 req/min global; **10 req/min on signup and login**.
* Express JSON / urlencoded body limit set to **100 KB**.
* `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — unknown fields rejected, types coerced.
* Bcrypt password hashing (10 rounds).
* JWT signed with `JWT_SECRET`; payload contains `sub` (user id) + `email` only.
* CORS limited to the configured `CORS_ORIGIN`.
* SQL injection — Prisma is the only DB access path; no raw queries.
* All authorisation goes through `MembershipService.resolveRole` + `Permissions.canX`. No controller writes ad-hoc role checks.

---

## Tradeoffs

* **SQLite via Prisma instead of MongoDB / Postgres** — chosen for zero-setup MVP. The data model is relational (board → members → users, board → tasks → assignee). Switching to Postgres is one Prisma datasource change away.
* **REST, not GraphQL** — REST is the right level of abstraction for an app with this shape. Each domain has a small, well-shaped controller.
* **No drag-and-drop on the Kanban** — moving cards uses an explicit `Move to …` dropdown. DnD is a polish item I'd add with `@dnd-kit/core`, calling the same `PATCH /tasks/:id { status }` endpoint.
* **No optimistic UI for moves** — the `useTasks` hook updates state after the API confirms. Acceptable for an MVP, but a noticeable UX win to flip to optimistic on a follow-up.
* **No realtime collaboration** — out of MVP scope. WebSockets / SSE would slot in cleanly via a Nest `Gateway` consuming Prisma write events.
* **No password reset / email verification** — out of MVP scope; would add a `password_reset_tokens` table and an email provider (Resend, Postmark).

---

## Scaling to 100k users

The current shape can take the MVP a long way; here is the path I'd take as load grows.

### 1. Database
* Move from SQLite to **PostgreSQL** (single env var change). Prisma handles the rest.
* Indexes already exist on `(boardId, status)`, `assigneeId`, `(boardId, userId)`, `ownerId`. Add a partial index on `tasks(boardId)` filtered by `status != 'DONE'` once the done-task volume dominates board reads.
* Use read replicas for the board / task list endpoints once read traffic outpaces writes.

### 2. Caching
* Add **Redis** in front of two hot endpoints:
  * `GET /boards/:id` (board + members + role) — cached per `(userId, boardId)`, invalidated on any board / member mutation.
  * `GET /boards/:id/tasks` — cached per board, invalidated on any task mutation.
* `MembershipService.resolveRole` is the per-request authorisation lookup — cache it for 60s per `(userId, boardId)`.

### 3. Background work
* Send notifications (task assigned, member invited) through a **queue** (BullMQ on Redis). Keep request paths fast and resilient.
* Long-running exports / digests run as queue workers.

### 4. Realtime
* For board collaboration, add a Nest **WebSocket gateway** (`socket.io`) that broadcasts task/member events to rooms keyed by `boardId`. Workers publish through Redis Pub/Sub so multiple Nest pods stay in sync.

### 5. Horizontal scale
* The API is stateless once the session is in a JWT, so it scales by replica count behind any L7 load balancer.
* Run Nest behind a process manager that respects graceful shutdown (Nest already supports `enableShutdownHooks`).
* SQLite obviously needs to be replaced before this — it's a single-file store.

### 6. Edge / CDN
* Serve the Next.js app via Vercel or any CDN — `next build` already emits the right asset hashes and static segments.
* Move user-uploaded content (e.g. avatars or attachments, when added) to **S3 / Vercel Blob** and serve through a CDN.

### 7. Observability
* **Structured logging** — pino with request-id middleware. Today the app uses Nest's default logger; pino is a one-module swap.
* **Metrics** — Prometheus client (`prom-client`) for request latency, queue depth, cache hit ratio.
* **Tracing** — OpenTelemetry SDK with auto-instrumentation for HTTP / Prisma / Redis.
* **Error tracking** — Sentry on both apps (configured via env, no source code coupling).

### 8. Rate limiting & abuse
* The current `@nestjs/throttler` is in-memory and per-pod. For a multi-pod deployment switch to its Redis storage to keep limits global.
* Add a stricter throttle on `/users/search` (cheap to call, abuses our DB).

### 9. Multi-tenancy / organisations
* Today each user is a free-floating account. A real product needs **Organisations** as the top-level unit. The schema change is small (`Org`, `OrgMember`, `Board.orgId`); the access-control layer cleanly extends — every existing `Permissions.canX` would gain an org-scope predicate composed before the board one.

---

## What I would do next

Short list, roughly in order of value-per-hour:

1. **Drag-and-drop** task moves (`@dnd-kit/core`), with optimistic state.
2. **Search / filter** beyond status — full-text on title/description, filter by assignee.
3. **Activity log** per board (server-side append, surfaced in a side drawer).
4. **Email verification + password reset** flows.
5. **Frontend tests** — Playwright for the golden-path workflow.
6. **CI** — GitHub Actions running typecheck + e2e on every PR.

---

## Scripts cheat-sheet

```bash
# Backend
npm run start:dev          # watch mode
npm run build              # tsc + nest build
npm run start:prod         # run built dist
npm run prisma:migrate     # apply schema migrations
npm run prisma:seed        # demo data
npm run test:e2e           # 19 e2e tests

# Frontend
npm run dev                # next dev
npm run build              # next build
npm run start              # next start
npm run typecheck          # tsc --noEmit
npm run lint               # next lint
```
#   T a s k F l o w - L i t e  
 