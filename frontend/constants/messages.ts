export const MESSAGES = {
  errors: {
    generic: 'Something went wrong. Please try again.',
    unauthorized: 'You need to sign in to continue.',
    forbidden: 'You do not have permission to do that.',
    notFound: 'The requested item could not be found.',
    network: 'Cannot reach the server. Check your connection.',
  },
  success: {
    boardCreated: 'Board created',
    boardUpdated: 'Board updated',
    boardDeleted: 'Board deleted',
    taskCreated: 'Task created',
    taskUpdated: 'Task updated',
    taskDeleted: 'Task deleted',
    memberAdded: 'Member added',
    memberRemoved: 'Member removed',
    memberRoleUpdated: 'Role updated',
  },
  empty: {
    boards: 'No boards yet. Create your first board to get started.',
    tasks: 'No tasks here yet.',
    members: 'No additional members yet.',
    search: 'No users matched your search.',
  },
} as const;
