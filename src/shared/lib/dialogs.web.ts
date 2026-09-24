import type { ConfirmOptions } from './dialogs.types';

/** Web: Alert з react-native у браузері нічого не показує, тому — браузерні діалоги. */
export function showMessage(title: string, message?: string): void {
  window.alert(message ? `${title}\n\n${message}` : title);
}

export async function confirm({ title, message }: ConfirmOptions): Promise<boolean> {
  return window.confirm(message ? `${title}\n\n${message}` : title);
}
