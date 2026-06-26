'use client';

import { useMemo } from 'react';
import type { Role } from '@/constants/roles';
import { Permissions } from '@/utils/permissions';

/**
 * Returns memoised permission predicates for a given role. The `isOwner`
 * argument is supplied per-call (e.g. per task) — bind it at the call site:
 *   const can = usePermissions(role);
 *   can.updateTask({ isOwner: task.createdById === user.id });
 */
export const usePermissions = (role: Role | null) =>
  useMemo(
    () => ({
      role,
      read: () => Permissions.canRead({ role }),
      createTask: () => Permissions.canCreateTask({ role }),
      updateTask: (ctx: { isOwner: boolean }) => Permissions.canUpdateTask({ role, ...ctx }),
      deleteTask: (ctx: { isOwner: boolean }) => Permissions.canDeleteTask({ role, ...ctx }),
      manageMembers: () => Permissions.canManageMembers({ role }),
      updateBoard: () => Permissions.canUpdateBoard({ role }),
      deleteBoard: () => Permissions.canDeleteBoard({ role }),
    }),
    [role],
  );
