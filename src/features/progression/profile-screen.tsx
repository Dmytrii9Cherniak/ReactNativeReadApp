import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/auth';
import { errorText, useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Button, Card, CenteredMessage, Icon, Loader, Screen, Text } from '@/shared/ui';

import { FactionAvatar } from './components/faction-avatar';
import { NonStopBadge } from './components/non-stop-badge';
import { RankLabel } from './components/rank-label';
import { RankLadder } from './components/rank-ladder';
import { TodayCard } from './components/today-card';
import { XpCard } from './components/xp-card';
import { useWatchAd } from './hooks/use-watch-ad';
import { XP_LIMITS } from './lib/xp-limits';
import { useProgressionStore } from './progression.store';

import type { ReactNode } from 'react';

/** Профіль (дизайн-документ, розділ 9): ранг, шкала XP, статистика, «Сьогодні», реклама. */
/** `extra` — блоки інших фіч під профілем (статистика читання, досягнення); збираються в маршруті. */
export function ProfileScreen({ extra }: { extra?: ReactNode }) {
  const t = useT();
  const user = useCurrentUser();
  const progress = useProgressionStore((s) => s.progress);
  const load = useProgressionStore((s) => s.load);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { watch, isWatching } = useWatchAd();

  useEffect(() => {
    // Свіжі цифри при кожному відкритті: вогники могли додатись
    load().catch((error: unknown) => setLoadError(errorText(t, error)));
  }, [load, t]);

  if (!user || !progress) {
    return loadError ? (
      <CenteredMessage title={t.common.loadError} description={loadError} />
    ) : (
      <Loader />
    );
  }

  const adsLeft = Math.max(0, XP_LIMITS.adsPerDay - progress.today.ads);

  return (
    <Screen gap={spacing.md}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/faction')}
        style={styles.hero}>
        <FactionAvatar factionId={progress.factionId} size={76} />
        <View style={styles.nameRow}>
          <Text variant="screenTitle">{user.nickname}</Text>
          {progress.nonStop.earned > 0 ? <NonStopBadge count={progress.nonStop.earned} /> : null}
        </View>
        <View style={styles.nameRow}>
          <RankLabel xp={progress.xp} factionId={progress.factionId} />
          <Icon name="chevron-right" size={14} color="gold" />
        </View>
      </Pressable>

      <XpCard xp={progress.xp} factionId={progress.factionId} />

      <View style={styles.stats}>
        <Stat
          icon="book"
          value={progress.storiesCount}
          label={t.progression.stories(progress.storiesCount)}
        />
        <Stat icon="zap" value={progress.firesReceived} label={t.progression.firesReceived} />
      </View>

      <TodayCard today={progress.today} />

      <Button
        title={t.progression.watchAd}
        icon="heart"
        onPress={() => void watch()}
        loading={isWatching}
        disabled={adsLeft === 0}
      />
      <Text variant="caption" color="textFaint" style={styles.center}>
        {t.progression.adsLeft(adsLeft)}
      </Text>

      {extra}

      <RankLadder xp={progress.xp} factionId={progress.factionId} />
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: 'book' | 'zap'; value: number; label: string }) {
  return (
    <Card style={styles.stat}>
      <Icon name={icon} size={16} color={icon === 'zap' ? 'ember' : 'textSecondary'} />
      <Text variant="display">{value}</Text>
      <Text variant="caption">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  center: { textAlign: 'center' },
});
