import type { ShareContent, ShareResult } from './share.types';

/**
 * Web: системне меню, якщо браузер його має (телефони, Safari); інакше або якщо
 * меню не відкрилось — посилання в буфер обміну.
 */
export async function share({ message, path }: ShareContent): Promise<ShareResult> {
  const url = `${window.location.origin}${path}`;

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: message, url });

      return 'shared';
    } catch (error) {
      // Користувач закрив меню — нічого не робимо
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'dismissed';
      }
    }
  }

  await navigator.clipboard.writeText(`${message}\n${url}`);

  return 'copied';
}
