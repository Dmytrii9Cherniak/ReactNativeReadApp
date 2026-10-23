import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { colors, radius, spacing, type ColorToken } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { ContentStatus } from '../types';

const STATUS_LOOK: Record<ContentStatus, { color: ColorToken; background: ColorToken }> = {
  pending: { color: 'gold', background: 'goldSurface' },
  published: { color: 'success', background: 'successSurface' },
  hidden: { color: 'textMuted', background: 'input' },
  rejected: { color: 'danger', background: 'dangerSurface' },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const t = useT();
  const look = STATUS_LOOK[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors[look.background] }]}>
      <Text variant="caption" color={look.color} style={styles.text}>
        {t.admin.status[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
