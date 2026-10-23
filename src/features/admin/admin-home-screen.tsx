import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RankLabel } from '@/features/progression';
import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Card, Icon, Loader, Screen, Text, type IconName } from '@/shared/ui';

import { useAdminStore } from './admin.store';
import { FactionBars } from './components/faction-bars';
import { StatTile } from './components/stat-tile';

interface Section {
  key: 'books' | 'stories' | 'users' | 'log' | 'broadcast';
  icon: IconName;
  href: Href;
}

const SECTIONS: readonly Section[] = [
  { key: 'books', icon: 'book', href: '/admin/books' },
  { key: 'stories', icon: 'sunrise', href: '/admin/stories' },
  { key: 'users', icon: 'users', href: '/admin/users' },
  { key: 'log', icon: 'list', href: '/admin/log' },
  { key: 'broadcast', icon: 'send', href: '/admin/broadcast' },
];

/** Головна адмінки: що чекає перевірки, цифри, розділи, угруповання, лідери. */
export function AdminHomeScreen() {
  const t = useT();
  const stats = useAdminStore((s) => s.stats);
  const loadStats = useAdminStore((s) => s.loadStats);

  useEffect(() => {
    loadStats().catch((error: unknown) => notify.error(errorText(t, error)));
  }, [loadStats, t]);

  if (!stats) {
    return <Loader />;
  }

  const pendingTotal = stats.pendingBooks + stats.pendingStories;
  const badges: Partial<Record<Section['key'], number>> = {
    books: stats.pendingBooks,
    stories: stats.pendingStories,
  };

  return (
    <Screen gap={spacing.lg}>
      <Card style={pendingTotal > 0 ? styles.attention : undefined}>
        <Text variant="sectionLabel" color={pendingTotal > 0 ? 'gold' : 'textMuted'}>
          {t.admin.attention}
        </Text>
        {pendingTotal > 0 ? (
          <View style={styles.attentionActions}>
            {stats.pendingBooks > 0 ? (
              <Button
                size="sm"
                icon="book"
                title={`${t.admin.sections.books}: ${t.admin.pendingCount(stats.pendingBooks)}`}
                onPress={() => router.push('/admin/books')}
              />
            ) : null}
            {stats.pendingStories > 0 ? (
              <Button
                size="sm"
                icon="sunrise"
                title={`${t.admin.sections.stories}: ${t.admin.pendingCount(stats.pendingStories)}`}
                onPress={() => router.push('/admin/stories')}
              />
            ) : null}
          </View>
        ) : (
          <Text variant="body">{t.admin.allClear}</Text>
        )}
      </Card>

      <View style={styles.tiles}>
        <StatTile value={stats.users} label={t.admin.stats.users} />
        <StatTile value={stats.newUsersWeek} label={t.admin.stats.newUsers} color="primaryLight" />
        <StatTile value={stats.publishedBooks} label={t.admin.stats.books} />
        <StatTile value={stats.storiesWeek} label={t.admin.stats.stories} color="primaryLight" />
        <StatTile value={stats.firesWeek} label={t.admin.stats.fires} color="ember" />
        <StatTile value={stats.blockedUsers} label={t.admin.stats.blocked} color="danger" />
      </View>

      <View style={styles.sections}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.key}
            accessibilityRole="button"
            onPress={() => router.push(section.href)}
            style={({ pressed }) => [styles.section, pressed && styles.pressed]}>
            <View style={styles.sectionIcon}>
              <Icon name={section.icon} size={18} color="primaryLight" />
            </View>
            <View style={styles.sectionText}>
              <Text variant="label">{t.admin.sections[section.key]}</Text>
              <Text variant="caption">{t.admin.sectionHints[section.key]}</Text>
            </View>
            {badges[section.key] ? (
              <View style={styles.badge}>
                <Text variant="caption" color="onPrimary" style={styles.badgeText}>
                  {badges[section.key]}
                </Text>
              </View>
            ) : null}
            <Icon name="chevron-right" size={16} />
          </Pressable>
        ))}
      </View>

      <FactionBars factions={stats.factions} />

      <Card>
        <Text variant="sectionLabel">{t.admin.topUsers}</Text>
        {stats.topUsers.map((user, index) => (
          <Pressable
            key={user.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/admin/user/[id]', params: { id: user.id } })}
            style={({ pressed }) => [styles.topUser, pressed && styles.pressed]}>
            <Text variant="label" color="textFaint" style={styles.place}>
              {index + 1}
            </Text>
            <View style={styles.sectionText}>
              <Text variant="label">{user.nickname}</Text>
              <RankLabel xp={user.xp} factionId={user.factionId} />
            </View>
            <Text variant="caption" color="primaryLight">{`${user.xp} XP`}</Text>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  attention: { borderColor: colors.gold, backgroundColor: colors.goldSurface },
  attentionActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sections: {
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryActive,
  },
  sectionText: { flex: 1, gap: 2 },
  badge: {
    minWidth: 22,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  badgeText: { fontWeight: '700' },
  topUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  place: { width: 20 },
  pressed: { opacity: 0.8 },
});
