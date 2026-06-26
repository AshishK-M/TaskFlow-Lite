import { ROLES, type Role } from '../constants/roles.constant';

export type PermissionContext = {
  role: Role | null;
  isOwner?: boolean; // true when the actor created the resource (e.g. task author)
};

const isPriviledged = (role: Role | null): boolean =>
  role === ROLES.OWNER || role === ROLES.ADMIN;

export const Permissions = {
  canRead: ({ role }: PermissionContext): boolean => role !== null,

  canCreateTask: ({ role }: PermissionContext): boolean =>
    role !== null && role !== ROLES.VIEWER,

  canUpdateTask: ({ role, isOwner }: PermissionContext): boolean =>
    isPriviledged(role) || (role === ROLES.MEMBER && !!isOwner),

  canDeleteTask: ({ role, isOwner }: PermissionContext): boolean =>
    isPriviledged(role) || (role === ROLES.MEMBER && !!isOwner),

  canManageMembers: ({ role }: PermissionContext): boolean => isPriviledged(role),

  canUpdateBoard: ({ role }: PermissionContext): boolean => isPriviledged(role),

  canDeleteBoard: ({ role }: PermissionContext): boolean => role === ROLES.OWNER,
};
