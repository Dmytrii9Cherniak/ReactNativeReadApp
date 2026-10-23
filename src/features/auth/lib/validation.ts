import type { Messages } from '@/shared/i18n';

export const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;

/** Кожна функція повертає текст першої помилки або null, якщо все гаразд. */

export function validateLogin(t: Messages, email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return t.auth.emailInvalid;
  }

  return password ? null : t.auth.passwordRequired;
}

interface SignupForm {
  nickname: string;
  email: string;
  password: string;
  isHuman: boolean;
  agreed: boolean;
}

export function validateSignup(t: Messages, form: SignupForm): string | null {
  if (!form.nickname.trim()) {
    return t.auth.nicknameRequired;
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    return t.auth.emailInvalid;
  }

  if (form.password.length < MIN_PASSWORD_LENGTH) {
    return t.auth.passwordShort;
  }

  if (!form.isHuman) {
    return t.auth.mustBeHuman;
  }

  return form.agreed ? null : t.auth.mustAgree;
}

export function validateCode(t: Messages, code: string): string | null {
  return CODE_PATTERN.test(code.trim()) ? null : t.auth.codeInvalid;
}
