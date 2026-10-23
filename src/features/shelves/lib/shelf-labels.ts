import type { Messages } from '@/shared/i18n';

import type { Shelf } from '../types';

export function getShelfLabel(t: Messages, shelf: Shelf): string {
  return t.shelves[shelf];
}
