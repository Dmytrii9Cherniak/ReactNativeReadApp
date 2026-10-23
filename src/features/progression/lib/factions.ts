import type { IconName } from '@/shared/ui';

import type { FactionId } from '../types';

export interface FactionInfo {
  id: FactionId;
  /** Колір кільця аватара й емблеми (дизайн-документ, розділ 7) */
  color: string;
  icon: IconName;
}

/** Порядок — як на екрані вибору угруповання. */
export const FACTIONS: readonly FactionInfo[] = [
  { id: 'loners', color: '#D4B44A', icon: 'briefcase' },
  { id: 'bandits', color: '#8E8E80', icon: 'frown' },
  { id: 'military', color: '#8A9160', icon: 'star' },
  { id: 'duty', color: '#C8574B', icon: 'shield' },
  { id: 'freedom', color: '#5FA868', icon: 'feather' },
  { id: 'scientists', color: '#5E8FAD', icon: 'aperture' },
  { id: 'mercenaries', color: '#6474C0', icon: 'crosshair' },
];

export function getFaction(id: FactionId): FactionInfo {
  return FACTIONS.find((faction) => faction.id === id) ?? FACTIONS[0];
}
