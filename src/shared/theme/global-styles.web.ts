import { colors } from './tokens';

const STYLE_ID = 'stalker-books-global';

/**
 * Web: тонкі смуги прокрутки в кольорах «Зони» замість сірих системних,
 * без «пружинного» прокручування всієї сторінки і з виділенням тексту в тон теми.
 * Firefox і нові Chrome беруть `scrollbar-width/color`, Safari — `::-webkit-scrollbar`.
 */
const css = `
* {
  scrollbar-width: thin;
  scrollbar-color: ${colors.borderActive} transparent;
}
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner { background: transparent; }
*::-webkit-scrollbar-thumb {
  background-color: ${colors.borderActive};
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}
*::-webkit-scrollbar-thumb:hover { background-color: ${colors.primary}; }
html, body {
  background-color: ${colors.background};
  overscroll-behavior: none;
}
::selection { background-color: ${colors.primaryActive}; color: ${colors.text}; }
`;

export function applyGlobalStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');

  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
