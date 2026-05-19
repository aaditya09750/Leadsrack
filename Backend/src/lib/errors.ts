export type AppErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: AppErrorCode;
  public readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (msg = 'Bad request', details?: unknown): AppError =>
  new AppError('BAD_REQUEST', msg, 400, details);

export const unauthorized = (msg = 'Unauthorized'): AppError =>
  new AppError('UNAUTHORIZED', msg, 401);

export const forbidden = (msg = 'Forbidden'): AppError => new AppError('FORBIDDEN', msg, 403);

export const notFound = (msg = 'Not found'): AppError => new AppError('NOT_FOUND', msg, 404);

export const conflict = (msg = 'Conflict'): AppError => new AppError('CONFLICT', msg, 409);

export const validationError = (msg = 'Validation failed', details?: unknown): AppError =>
  new AppError('VALIDATION_ERROR', msg, 422, details);
