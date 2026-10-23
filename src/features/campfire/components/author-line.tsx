import { StyleSheet, View } from 'react-native';

import { NonStopBadge, RankLabel } from '@/features/progression';
import { campfireColors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { StoryAuthor } from '../types';

interface AuthorLineProps {
  author: StoryAuthor;
  /** «3 дні тому», «тиждень тому · 4 хв читання» */
  meta: string;
}

/** Аватар-літера, нік з бейджем «non stop», ранг · угруповання і час. */
export function AuthorLine({ author, meta }: AuthorLineProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text variant="label" style={styles.letter}>
          {author.nickname.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text variant="caption" style={styles.name} numberOfLines={1}>
            {`${author.nickname} · ${meta}`}
          </Text>
          {author.hasNonStop ? <NonStopBadge /> : null}
        </View>
        <RankLabel xp={author.xp} factionId={author.factionId} />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: campfireColors.buttonSurface,
  },
  letter: { color: campfireColors.ember },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1, color: campfireColors.textSecondary },
});
