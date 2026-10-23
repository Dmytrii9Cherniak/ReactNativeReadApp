/**
 * Web: прибрати фокус з натиснутої кнопки.
 *
 * Після кліку браузер лишає фокус на кнопці. Якщо цей клік ховає екран чи меню
 * (навігація, закриття меню), React Navigation ставить на них aria-hidden — і Chrome
 * пише «Blocked aria-hidden … descendant retained focus». Знімаємо фокус до навігації.
 */
export function releaseFocus(): void {
  const active = document.activeElement;

  if (active instanceof HTMLElement) {
    active.blur();
  }
}
