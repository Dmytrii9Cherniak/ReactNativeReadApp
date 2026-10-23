import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAsync } from '@/shared/hooks/use-async';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Card, Loader, Screen, Text } from '@/shared/ui';

import { FactionEmblem } from './components/faction-emblem';
import { FACTIONS } from './lib/factions';
import { XP_LIMITS } from './lib/xp-limits';
import { progressionApi } from './progression.api';
import { useProgressionStore } from './progression.store';

import type { FactionId, Progress } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Днів до можливості змінити угруповання; 0 — можна вже зараз. */
function getCooldownDays(progress: Progress): number {
  if (!progress.factionChangedAt) {
    return 0;
  }

  const unlockAt =
    new Date(progress.factionChangedAt).getTime() + XP_LIMITS.factionCooldownDays * DAY_MS;

  return Math.max(0, Math.ceil((unlockAt - Date.now()) / DAY_MS));
}

/** Вибір угруповання (дизайн-документ, розділ 10). */
export function FactionScreen() {
  const t = useT();
  const progress = useProgressionStore((s) => s.progress);
  const joinFaction = useProgressionStore((s) => s.joinFaction);
  const factions = useAsync('factions', () => progressionApi.listFactions());
  const [selected, setSelected] = useState<FactionId | null>(null);
  const { submit, isSubmitting, error } = useSubmit(joinFaction);

  if (!progress) {
    return <Loader />;
  }

  const current = progress.factionId;
  const target = selected ?? current;
  const cooldownDays = getCooldownDays(progress);
  const members = (id: FactionId) =>
    factions.status === 'ready'
      ? factions.value.find((item) => item.id === id)?.members
      : undefined;

  const footer =
    target === current ? (
      <Button variant="outline" title={t.progression.alreadyIn(t.factions[current])} disabled />
    ) : cooldownDays > 0 ? (
      <Button variant="outline" title={t.progression.cooldown(cooldownDays)} disabled />
    ) : (
      <Button
        title={t.progression.join(t.factions[target])}
        loading={isSubmitting}
        onPress={() => void submit(target)}
      />
    );

  return (
    <Screen
      gap={spacing.md}
      footer={
        <View style={styles.footer}>
          {error ? (
            <Text variant="caption" color="danger">
              {error}
            </Text>
          ) : null}
          {footer}
        </View>
      }>
      <Card>
        <Text variant="caption" color="textSecondary">
          {t.progression.factionHint}
        </Text>
      </Card>
      <View style={styles.grid}>
        {FACTIONS.map((faction) => {
          const isCurrent = faction.id === current;
          const isSelected = faction.id === target;
          const count = members(faction.id);

          return (
            <Pressable
              key={faction.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(faction.id)}
              style={[styles.card, isSelected && styles.selected]}>
              <FactionEmblem factionId={faction.id} />
              <Text variant="label" color={isSelected ? 'gold' : 'text'}>
                {t.factions[faction.id]}
              </Text>
              <Text variant="caption" color="textFaint">
                {count === undefined ? ' ' : t.progression.members(count)}
              </Text>
              {isCurrent ? (
                <View style={styles.badge}>
                  <Text variant="sectionLabel" color="onPrimary" style={styles.badgeText}>
                    {t.progression.current}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.gold, backgroundColor: colors.goldSurface },
  badge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  badgeText: { fontSize: 9, lineHeight: 12, fontWeight: '700' },
  footer: { gap: spacing.sm },
});
