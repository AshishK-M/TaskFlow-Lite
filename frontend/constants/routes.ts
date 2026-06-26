export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  boards: '/boards',
  board: (id: string) => `/boards/${id}`,
} as const;
