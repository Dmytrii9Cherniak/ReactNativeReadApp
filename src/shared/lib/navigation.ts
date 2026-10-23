import { router } from 'expo-router';

/**
 * «Назад», який не падає: якщо екран відкрито напряму (посилання, оновлення сторінки
 * в браузері) і повертатися нікуди — йдемо на головну.
 */
export function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
