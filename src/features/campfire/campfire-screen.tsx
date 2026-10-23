import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { useCan } from '@/features/auth';
import { useProgress } from '@/features/progression';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { errorText, useT } from '@/shared/i18n';
import { campfireColors, spacing } from '@/shared/theme';
import { Button, CenteredMessage, Loader, Text } from '@/shared/ui';

import { useCampfireStore } from './campfire.store';
import { StoryCard } from './components/story-card';

/** Стрічка «Біля вогнища» (макет, екран 12). Читати можуть усі, розповідати — після входу. */
export function CampfireScreen() {
  const t = useT();
  const stories = useCampfireStore((s) => s.stories);
  const load = useCampfireStore((s) => s.load);
  const canTell = useCan('campfire.tell');
  const progress = useProgress();
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);

    try {
      await load();
      setError(null);
    } catch (caught) {
      setError(errorText(t, caught));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load().catch((caught: unknown) => setError(errorText(t, caught)));
  }, [load, t]);

  if (!stories) {
    return error ? (
      <CenteredMessage title={t.common.loadError} description={error} />
    ) : (
      <View style={styles.screen}>
        <Loader />
      </View>
    );
  }

  const hasToldToday = (progress?.today.story ?? 0) > 0;

  const tell = () => router.push(canTell ? '/story/new' : '/login');

  return (
    <View style={styles.screen}>
      <FlatList
        data={stories}
        keyExtractor={(story) => story.id}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            onOpen={() => router.push({ pathname: '/story/[id]', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="screenTitle" style={styles.title}>
              {`🔥 ${t.campfire.title}`}
            </Text>
            <Text variant="caption" style={styles.subtitle}>
              {t.campfire.subtitle}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text variant="caption" style={styles.subtitle}>
            {t.campfire.empty}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={campfireColors.ember}
          />
        }
        style={styles.list}
        contentContainerStyle={styles.content}
      />
      <View style={styles.footer}>
        <Text variant="caption" style={styles.limit}>
          {canTell ? t.campfire.oncePerDay : t.campfire.loginToTell}
        </Text>
        <Button
          variant="ember"
          icon="plus"
          title={t.campfire.tell}
          disabled={hasToldToday}
          onPress={tell}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireColors.background },
  list: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: 120,
  },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  title: { color: campfireColors.title },
  subtitle: { color: campfireColors.textSecondary },
  footer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  limit: { color: campfireColors.textMuted },
});
