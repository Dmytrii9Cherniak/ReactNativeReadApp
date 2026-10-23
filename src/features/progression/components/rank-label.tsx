import { useT } from '@/shared/i18n';
import { Text } from '@/shared/ui';

import { getRank } from '../lib/ranks';

import type { FactionId } from '../types';
import type { StyleProp, TextStyle } from 'react-native';

interface RankLabelProps {
  xp: number;
  factionId: FactionId;
  style?: StyleProp<TextStyle>;
}

/** «Ранг · Угруповання»: ранні ранги сірим, від «Сталкера» — золотистим. */
export function RankLabel({ xp, factionId, style }: RankLabelProps) {
  const t = useT();
  const rank = getRank(xp, factionId);

  return (
    <Text
      variant="caption"
      color={rank.isGold ? 'gold' : 'textMuted'}
      style={style}
      numberOfLines={1}>
      {`${rank.name} · ${t.factions[factionId]}`}
    </Text>
  );
}
