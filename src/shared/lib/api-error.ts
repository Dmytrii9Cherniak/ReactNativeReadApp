/**
 * Коди помилок API. Однакові для тестового сервера й майбутнього бекенду;
 * тексти для користувача — у словнику `t.errors`.
 */
export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'invalid_credentials'
  | 'email_taken'
  | 'invalid_code'
  | 'story_limit'
  | 'ad_limit'
  | 'faction_cooldown'
  | 'fire_own_story'
  | 'already_fired'
  | 'cannot_change_own_role';

export class ApiError extends Error {
  constructor(readonly code: ApiErrorCode) {
    super(code);
  }
}

export function isApiError(error: unknown, code?: ApiErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}
