import type { ApiError } from '@/types/api';

export class ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiClientError);
    }
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }

  return 'An unexpected error occurred';
}

export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof ApiClientError && error.errors) {
    return error.errors;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    typeof (error as { errors: unknown }).errors === 'object'
  ) {
    return (error as { errors: Record<string, string[]> }).errors;
  }

  return {};
}
