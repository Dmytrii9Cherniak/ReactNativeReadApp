/** Помилка API у форматі сервера `{ error: { code, message } }`. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Помилки окремих полів форми: `{ email: 'Некоректна пошта' }` */
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Сервер недоступний: вимкнений, інша мережа, немає інтернету. */
export const NETWORK_ERROR = 'network_error';

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

interface ErrorBody {
  error: { code: string; message: string; issues?: { path: string; message: string }[] };
}

function isErrorBody(data: unknown): data is ErrorBody {
  return typeof data === 'object' && data !== null && 'error' in data;
}

export function toApiError(status: number, data: unknown): ApiError {
  if (!isErrorBody(data)) {
    return new ApiError(status, 'unknown_error', `Помилка сервера (${status})`);
  }

  const { code, message, issues = [] } = data.error;
  const fieldErrors = Object.fromEntries(issues.map((issue) => [issue.path, issue.message]));

  return new ApiError(status, code, message, fieldErrors);
}
