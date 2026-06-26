export type ApiSuccess<T> = { success: true; data: T };

export type ApiError = {
  success: false;
  error: { message: string; statusCode: number; details?: unknown };
  path?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
