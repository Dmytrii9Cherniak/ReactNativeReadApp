import { isApiError } from '@/shared/lib/api-error';

import type { Messages } from './uk';

/** Текст помилки для користувача: відомі коди API — перекладені, решта — «щось пішло не так». */
export function errorText(t: Messages, error: unknown): string {
  return isApiError(error) ? t.errors[error.code] : t.errors.unknown;
}
