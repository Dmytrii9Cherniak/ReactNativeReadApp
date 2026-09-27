import { CenteredMessage } from '@/shared/ui';

import type { PdfReaderProps } from './pdf-reader.types';

/**
 * iOS / Android: поки працюємо через Expo Go, нативного рендера PDF немає.
 * Коли налаштуємо власну збірку (APK), тут буде react-native-pdf з тим самим API (PdfReaderProps).
 * Web-версія: pdf-reader.web.tsx
 */
export function PdfReader(_props: PdfReaderProps) {
  return (
    <CenteredMessage
      title="PDF на телефоні — згодом"
      description="Перегляд PDF на iOS / Android з'явиться після налаштування власної збірки (APK). У браузері PDF уже працює."
    />
  );
}
