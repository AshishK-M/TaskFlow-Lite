export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);

export const ASSIGNABLE_ROLES: Role[] = [ROLES.ADMIN, ROLES.MEMBER, ROLES.VIEWER];
