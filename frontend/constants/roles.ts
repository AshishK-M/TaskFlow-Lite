export const ROLES = {
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);

/**
 * Roles a board owner can assign to a user. OWNER is established at board
 * creation and is not assignable through the members endpoint.
 */
export const ASSIGNABLE_ROLES: Role[] = [ROLES.EDITOR, ROLES.VIEWER];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Full control of the board, including member management.',
  EDITOR: 'Can create, edit, and delete tasks.',
  VIEWER: 'Read-only access to the board.',
};
