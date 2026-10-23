/** Ролі елементів, які лишають фокус після кліку мишею чи дотику. */
const PRESSABLE_ROLES = new Set(['button', 'link', 'tab', 'checkbox', 'radio', 'menuitem']);

let isInstalled = false;

function isPressable(element: HTMLElement): boolean {
  return element.tagName === 'BUTTON' || PRESSABLE_ROLES.has(element.getAttribute('role') ?? '');
}

/**
 * Web: після кліку браузер лишає фокус на кнопці. Якщо клік ховає екран чи меню
 * (навігація, «Назад» у шапці, закриття меню), React Navigation ставить на них
 * aria-hidden — і Chrome пише «Blocked aria-hidden … descendant retained focus».
 *
 * Один слухач на весь документ (фаза capture — раніше за обробники кнопок) знімає
 * фокус з натиснутої кнопки. Покриває й кнопки бібліотек (шапка, ☰), а поля вводу
 * не чіпає. Фокус з клавіатури (Tab) лишається — він не йде через pointer.
 */
export function installFocusRelease(): void {
  if (isInstalled || typeof document === 'undefined') {
    return;
  }

  isInstalled = true;

  document.addEventListener(
    'pointerup',
    () => {
      const active = document.activeElement;

      if (active instanceof HTMLElement && isPressable(active)) {
        active.blur();
      }
    },
    true,
  );
}
