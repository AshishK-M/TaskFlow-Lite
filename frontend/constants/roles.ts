export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);
export const ASSIGNABLE_ROLES: Role[] = [ROLES.ADMIN, ROLES.MEMBER, ROLES.VIEWER];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Full control of the board.',
  ADMIN: 'Manage tasks and members.',
  MEMBER: 'Create and update tasks.',
  VIEWER: 'Read-only access.',
};
