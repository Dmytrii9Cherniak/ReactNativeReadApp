import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { errorText, formatRelativeTime, useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Badge, Button, CenteredMessage, Icon, Loader, Text, type BadgeTone } from '@/shared/ui';

import { uploadApi } from './upload.api';

import type { MySubmission, SubmissionStatus } from './types';

const STATUS_TONE: Record<SubmissionStatus, BadgeTone> = {
  pending: 'gold',
  published: 'success',
  hidden: 'muted',
  rejected: 'danger',
};

/** Мої книги та історії зі станом перевірки й причиною відхилення. */
export function MySubmissionsScreen() {
  const t = useT();
  const [items, setItems] = useState<MySubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    uploadApi
      .listMine()
      .then(setItems)
      .catch((caught: unknown) => setError(errorText(t, caught)));
  }, [t]);

  if (!items) {
    return error ? <CenteredMessage title={t.common.loadError} description={error} /> : <Loader />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.kind}:${item.id}`}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <CenteredMessage title={t.submissions.empty}>
          <Button
            title={t.submissions.uploadBook}
            icon="upload"
            onPress={() => router.push('/upload')}
          />
        </CenteredMessage>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Icon name={item.kind === 'book' ? 'book' : 'sunrise'} color="primaryLight" />
          <View style={styles.text}>
            <Text variant="label">{item.title}</Text>
            <Text variant="caption">
              {`${item.kind === 'book' ? t.submissions.book : t.submissions.story} · ${formatRelativeTime(t, item.submittedAt)}`}
            </Text>
            <Badge label={t.admin.status[item.status]} tone={STATUS_TONE[item.status]} />
            {item.rejectReason ? (
              <Text variant="caption" color="danger">
                {t.admin.rejectedBecause(item.rejectReason)}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { flex: 1, gap: spacing.xs },
});
