import { ROLES, type Role } from '../constants/roles.constant';

/**
 * The single source of truth for what each role is allowed to do on a board.
 * Every controller / service that needs to gate an action calls one of these
 * helpers — there are no ad-hoc role comparisons elsewhere in the codebase.
 *
 * Permission matrix (assignment requirement):
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
