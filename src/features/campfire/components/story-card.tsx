import { Pressable, StyleSheet, View } from 'react-native';

import { formatRelativeTime, useT } from '@/shared/i18n';
import { borderWidth, campfireColors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { AuthorLine } from './author-line';
import { FireButton } from './fire-button';

import type { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onOpen: () => void;
}

/** Картка стрічки (макет, екран 12): автор, назва, початок тексту, вогники, «Читати →». */
export function StoryCard({ story, onOpen }: StoryCardProps) {
  const t = useT();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <AuthorLine author={story.author} meta={formatRelativeTime(t, story.createdAt)} />
      <Text variant="label" style={styles.title}>
        {story.title}
      </Text>
      <Text variant="caption" style={styles.excerpt} numberOfLines={3}>
        {story.body}
      </Text>
      <View style={styles.footer}>
        <FireButton count={story.fires} isLit={story.firedByMe} />
        {story.status === 'published' ? null : (
          <Text variant="caption" style={styles.pending}>
            {t.admin.status[story.status]}
          </Text>
        )}
        <Text variant="caption" style={styles.read}>
          {t.campfire.read}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: campfireColors.border,
    backgroundColor: campfireColors.card,
  },
  pressed: { opacity: 0.85 },
  title: { fontSize: 16, color: campfireColors.title },
  excerpt: { fontSize: 13, lineHeight: 19, color: campfireColors.body },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  pending: { color: campfireColors.textMuted, fontStyle: 'italic' },
  read: { marginLeft: 'auto', color: campfireColors.textSecondary },
});
