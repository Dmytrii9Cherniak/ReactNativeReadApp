/** Умовна сторінка — 1800 знаків (стандарт машинописної сторінки). Для форматів без сторінок. */
export const CHARS_PER_PAGE = 1800;

export function charsToPages(chars: number): number {
  return chars / CHARS_PER_PAGE;
}

/** Прочитане зберігається дробовим, показуємо лише повні сторінки. */
export function formatPages(pages: number): string {
  return `${Math.floor(pages)} стор.`;
}
