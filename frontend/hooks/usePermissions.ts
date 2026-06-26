'use client';

import { useMemo } from 'react';
import type { Role } from '@/constants/roles';
import { Permissions } from '@/utils/permissions';

/**
 * Memoised permission predicates for a given role. The 3-role model has no
 * per-task ownership carve-out — EDITOR can act on any task.
 */
export const usePermissions = (role: Role | null) =>
  useMemo(
    () => ({
      role,
      viewBoard: () => Permissions.canViewBoard(role),
      viewTask: () => Permissions.canViewTask(role),
      createTask: () => Permissions.canCreateTask(role),
      updateTask: () => Permissions.canUpdateTask(role),
      deleteTask: () => Permissions.canDeleteTask(role),
      manageMembers: () => Permissions.canManageMembers(role),
      updateBoard: () => Permissions.canUpdateBoard(role),
      deleteBoard: () => Permissions.canDeleteBoard(role),
    }),
    [role],
  );
