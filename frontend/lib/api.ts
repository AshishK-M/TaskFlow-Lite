import axios, { AxiosError, type AxiosInstance } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants/api';
import { MESSAGES } from '@/constants/messages';
import { storage } from './storage';

type ApiErrorBody = {
  success: false;
  error: { message: string; statusCode: number; details?: unknown };
};

export class ApiError extends Error {
  statusCode: number;
  details: unknown;
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.get<string>(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Backend wraps payload as { success: true, data: T }. Unwrap once here so
    // services and hooks deal with plain domain data only.
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && body.success === true) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(MESSAGES.errors.network, 0));
    }
    const status = error.response.status;
    const body = error.response.data;
    const message = body?.error?.message ?? error.message ?? MESSAGES.errors.generic;

    if (status === 401 && typeof window !== 'undefined') {
      storage.remove(STORAGE_KEYS.token);
      storage.remove(STORAGE_KEYS.user);
      // soft redirect: only if we are inside a protected route
      const onAuthPage =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/signup');
      if (!onAuthPage) window.location.href = '/login';
    }
    return Promise.reject(new ApiError(message, status, body?.error?.details));
  },
);

export { api };
