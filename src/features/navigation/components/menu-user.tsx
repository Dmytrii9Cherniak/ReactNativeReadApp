import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/auth';
import { FactionAvatar, NonStopBadge, RankLabel, useProgress } from '@/features/progression';
import { useT } from '@/shared/i18n';
import { releaseFocus } from '@/shared/lib/focus';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Icon, Text } from '@/shared/ui';

/** Верх меню: користувач з рангом (тап — профіль) або «Гість» з кнопкою входу. */
export function MenuUser({ onNavigate }: { onNavigate: () => void }) {
  const t = useT();
  const user = useCurrentUser();
  const progress = useProgress();

  if (!user) {
    return (
      <View style={styles.block}>
        <View style={styles.guestAvatar}>
          <Icon name="user" size={20} color="primaryLight" />
        </View>
        <Text variant="label" color="primaryLight">
          {t.menu.guest}
        </Text>
        <Text variant="caption">{t.menu.guestHint}</Text>
        <Button
          title={t.menu.login}
          icon="log-in"
          style={styles.login}
          onPress={() => {
            onNavigate();
            router.push('/login');
          }}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        releaseFocus();
        onNavigate();
        router.navigate('/profile');
      }}
      style={styles.block}>
      {progress ? (
        <FactionAvatar factionId={progress.factionId} size={48} />
      ) : (
        <View style={styles.guestAvatar}>
          <Icon name="user" size={20} color="primaryLight" />
        </View>
      )}
      <View style={styles.nameRow}>
        <Text variant="label" color="primaryLight" style={styles.name} numberOfLines={1}>
          {user.nickname.toUpperCase()}
        </Text>
        {progress && progress.nonStop.earned > 0 ? <NonStopBadge /> : null}
      </View>
      {progress ? <RankLabel xp={progress.xp} factionId={progress.factionId} /> : null}
      <Text variant="caption" color="textFaint" numberOfLines={1}>
        {`${user.email} · ${t.roles[user.role]}`}
      </Text>
    </Pressable>
  );
}

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  block: { gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  guestAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.primaryActive,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  name: { flexShrink: 1 },
  login: { marginTop: spacing.md },
});
