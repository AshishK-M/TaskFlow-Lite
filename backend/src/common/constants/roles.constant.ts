export const ROLES = {
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);

/**
 * Roles that can be granted to a user via the members endpoint. OWNER is
 * established only at board creation and cannot be assigned afterwards.
 */
export const ASSIGNABLE_ROLES: Role[] = [ROLES.EDITOR, ROLES.VIEWER];
