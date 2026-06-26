import { ROLES, type Role } from '@/constants/roles';

/**
 * Frontend mirror of the backend permission utility. Only used to hide UI
 * controls a user couldn't successfully invoke anyway — the backend is the
 * actual security boundary (see `backend/src/common/utils/permissions.util.ts`).
 *
 * Permission matrix:
 *   | Action          | OWNER | EDITOR | VIEWER |
 *   | View board      |   ✅   |   ✅   |   ✅   |
 *   | View tasks      |   ✅   |   ✅   |   ✅   |
 *   | Create task     |   ✅   |   ✅   |   ❌   |
 *   | Update task     |   ✅   |   ✅   |   ❌   |
 *   | Delete task     |   ✅   |   ✅   |   ❌   |
 *   | Manage members  |   ✅   |   ❌   |   ❌   |
 *   | Update board    |   ✅   |   ❌   |   ❌   |
 *   | Delete board    |   ✅   |   ❌   |   ❌   |
 */
export const Permissions = {
  canViewBoard: (role: Role | null): boolean => role !== null,
  canViewTask: (role: Role | null): boolean => role !== null,
  canCreateTask: (role: Role | null): boolean =>
    role === ROLES.OWNER || role === ROLES.EDITOR,
  canUpdateTask: (role: Role | null): boolean =>
    role === ROLES.OWNER || role === ROLES.EDITOR,
  canDeleteTask: (role: Role | null): boolean =>
    role === ROLES.OWNER || role === ROLES.EDITOR,
  canManageMembers: (role: Role | null): boolean => role === ROLES.OWNER,
  canUpdateBoard: (role: Role | null): boolean => role === ROLES.OWNER,
  canDeleteBoard: (role: Role | null): boolean => role === ROLES.OWNER,
};
