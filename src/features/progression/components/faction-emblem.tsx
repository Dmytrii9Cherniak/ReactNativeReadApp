import { StyleSheet, View } from 'react-native';

import { borderWidth, radius } from '@/shared/theme';
import { Icon } from '@/shared/ui';

import { getFaction } from '../lib/factions';

import type { FactionId } from '../types';

/** Кругла емблема угруповання для карток вибору. */
export function FactionEmblem({ factionId, size = 44 }: { factionId: FactionId; size?: number }) {
  const faction = getFaction(factionId);

  return (
    <View
      style={[
        styles.emblem,
        { width: size, height: size, borderRadius: size / 2, borderColor: faction.color },
      ]}>
      <Icon name={faction.icon} size={Math.round(size * 0.45)} color="text" />
    </View>
  );
}

const styles = StyleSheet.create({
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.accent,
    borderRadius: radius.pill,
  },
});
