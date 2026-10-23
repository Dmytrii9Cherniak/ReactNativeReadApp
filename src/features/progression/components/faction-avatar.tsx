import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius } from '@/shared/theme';
import { Icon } from '@/shared/ui';

import { getFaction } from '../lib/factions';

import type { FactionId } from '../types';

interface FactionAvatarProps {
  factionId: FactionId;
  size?: number;
}

/** Аватар з кільцем кольору угруповання і маленькою емблемою (дизайн-документ, розділ 9). */
export function FactionAvatar({ factionId, size = 72 }: FactionAvatarProps) {
  const faction = getFaction(factionId);
  const emblemSize = Math.round(size * 0.36);

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderColor: faction.color, borderRadius: size / 2 },
      ]}>
      <Icon name="user" size={Math.round(size * 0.4)} color="primaryLight" />
      <View
        style={[
          styles.emblem,
          { width: emblemSize, height: emblemSize, borderColor: faction.color },
        ]}>
        <Icon name={faction.icon} size={Math.round(emblemSize * 0.55)} color="text" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.accent,
    backgroundColor: colors.goldSurface,
  },
  emblem: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    backgroundColor: colors.background,
  },
});
