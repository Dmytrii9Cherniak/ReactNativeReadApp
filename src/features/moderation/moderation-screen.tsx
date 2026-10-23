import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { useAsync } from '@/shared/hooks/use-async';
import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { Button, CenteredMessage, Loader, Text, UnderlineTabs } from '@/shared/ui';

import { moderationApi } from './moderation.api';

import type { ModerationItem, ModerationKind } from './types';

const KINDS: readonly ModerationKind[] = ['book', 'story'];

/** Перевірка надісланого (макет, екран 8): книги й історії — одна черга для модераторів. */
export function ModerationScreen() {
  const t = useT();
  const [kind, setKind] = useState<ModerationKind>('book');
  const queue = useAsync(`moderation:${kind}`, () => moderationApi.list(kind));
  /** Вже вирішені в цьому сеансі — ховаємо без перезавантаження черги */
  const [decided, setDecided] = useState<ReadonlySet<string>>(new Set());

  const decide = async (item: ModerationItem, approve: boolean) => {
    try {
      await (approve
        ? moderationApi.approve(item.kind, item.id)
        : moderationApi.reject(item.kind, item.id));
      setDecided((ids) => new Set(ids).add(item.id));
    } catch (error) {
      notify.error(errorText(t, error));
    }
  };

  const open = (item: ModerationItem) => {
    // Історію на перевірці модератор може прочитати; книгу — після схвалення
    if (item.kind === 'story') {
      router.push({ pathname: '/story/[id]', params: { id: item.id } });
    }
  };

  return (
    <View style={styles.screen}>
      <UnderlineTabs
        tabs={KINDS}
        active={kind}
        onChange={setKind}
        getLabel={(item) => (item === 'book' ? t.moderation.books : t.moderation.stories)}
      />
      {queue.status === 'loading' ? (
        <Loader />
      ) : queue.status === 'error' ? (
        <CenteredMessage title={t.common.loadError} description={queue.message} />
      ) : (
        <FlatList
          data={queue.value.filter((item) => !decided.has(item.id))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ListEmptyComponent={<CenteredMessage title={t.moderation.empty} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable style={styles.info} onPress={() => open(item)}>
                <Text variant="bookTitle">{item.title}</Text>
                <Text variant="caption">
                  {`${item.author} · ${t.moderation.addedBy(item.submittedBy)}`}
                </Text>
              </Pressable>
              <Button
                variant="success"
                size="sm"
                icon="check"
                accessibilityLabel={t.moderation.approve}
                onPress={() => void decide(item, true)}
              />
              <Button
                variant="danger"
                size="sm"
                icon="x"
                accessibilityLabel={t.moderation.reject}
                onPress={() => void decide(item, false)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  info: { flex: 1, gap: 2 },
});
