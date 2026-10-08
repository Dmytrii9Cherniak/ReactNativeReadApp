import { NETWORK_ERROR, isApiError } from '@/shared/api';

export interface FormErrors {
  /** Помилки полів з валідації сервера: `{ email: '...' }` */
  fields: Record<string, string>;
  /** Загальна помилка форми */
  message: string | null;
}

/** Помилку відправки форми — у вигляд для показу. */
export function toFormErrors(error: unknown): FormErrors {
  if (!error) {
    return { fields: {}, message: null };
  }

  if (!isApiError(error)) {
    return { fields: {}, message: 'Щось пішло не так. Спробуй ще раз' };
  }

  if (error.code === NETWORK_ERROR) {
    return {
      fields: {},
      message: "Немає зв'язку з сервером. Перевір інтернет і чи запущений сервер",
    };
  }

  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;

  return { fields: error.fieldErrors, message: hasFieldErrors ? null : error.message };
}
