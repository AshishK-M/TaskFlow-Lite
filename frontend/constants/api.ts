export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
  },
  users: {
    search: (q: string) => `/users/search?q=${encodeURIComponent(q)}`,
  },
  boards: {
    list: '/boards',
    detail: (id: string) => `/boards/${id}`,
  },
  tasks: {
    list: (boardId: string) => `/boards/${boardId}/tasks`,
    detail: (boardId: string, taskId: string) => `/boards/${boardId}/tasks/${taskId}`,
  },
  members: {
    list: (boardId: string) => `/boards/${boardId}/members`,
    detail: (boardId: string, memberId: string) => `/boards/${boardId}/members/${memberId}`,
  },
} as const;

export const STORAGE_KEYS = {
  token: 'kanban.token',
  user: 'kanban.user',
} as const;
