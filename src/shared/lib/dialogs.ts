import { Alert } from 'react-native';

import type { ConfirmOptions } from './dialogs.types';

/** iOS / Android — нативні діалоги. Web-версія: dialogs.web.ts */
export function showMessage(title: string, message?: string): void {
  Alert.alert(title, message);
}

export function confirm({
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Скасувати',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
