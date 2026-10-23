import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatRelativeTime, useT } from '@/shared/i18n';
import { confirm } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Button, Text, UnderlineTabs } from '@/shared/ui';

import { adminApi } from './admin.api';
import { AdminList } from './components/admin-list';
import { AdminRow } from './components/admin-row';
import { ReasonDialog } from './components/reason-dialog';
import { SearchField } from './components/search-field';
import { StatusBadge } from './components/status-badge';
import { useAdminAction } from './lib/use-admin-action';
import { useAdminQuery } from './lib/use-admin-query';
import { useSearch } from './lib/use-search';

import type { AdminStory, ContentStatus } from './types';

const STATUSES: readonly ContentStatus[] = ['pending', 'published', 'hidden', 'rejected'];
const PREVIEW_LINES = 4;

/** Історії «Біля вогнища»: перевірка, приховування, видалення. Текст читається прямо в списку. */
export function AdminStoriesScreen() {
  const t = useT();
  const [status, setStatus] = useState<ContentStatus>('pending');
  const { input, search, setInput } = useSearch();
  const { state, refresh } = useAdminQuery(`admin-stories:${status}:${search}`, () =>
    adminApi.listStories({ status, search }),
  );
  const { run } = useAdminAction(refresh);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminStory | null>(null);

  const remove = async (story: AdminStory) => {
    const isConfirmed = await confirm({
      title: t.admin.confirmDelete(story.title),
      message: t.admin.deleteHint,
      confirmText: t.admin.remove,
      destructive: true,
    });

    if (isConfirmed) {
      await run(() => adminApi.deleteStory(story.id), t.admin.done.deleted);
    }
  };

  const renderStory = ({ item }: { item: AdminStory }) => {
    const isExpanded = expanded === item.id;

    return (
      <AdminRow
        title={item.title}
        subtitle={`${item.author.nickname} · ${formatRelativeTime(t, item.createdAt)} · ${t.admin.fires(item.fires)}`}
        meta={<StatusBadge status={item.status} />}>
        <Text
          variant="caption"
          color="textSecondary"
          numberOfLines={isExpanded ? undefined : PREVIEW_LINES}>
          {item.body}
        </Text>
        {item.rejectReason ? (
          <Text variant="caption" color="danger">
            {t.admin.rejectedBecause(item.rejectReason)}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            size="sm"
            variant="outline"
            icon={isExpanded ? 'chevron-up' : 'chevron-down'}
            accessibilityLabel={t.campfire.read}
            onPress={() => setExpanded(isExpanded ? null : item.id)}
          />
          {item.status === 'pending' || item.status === 'rejected' ? (
            <Button
              size="sm"
              variant="success"
              icon="check"
              title={t.admin.approve}
              onPress={() => void run(() => adminApi.approveStory(item.id), t.admin.done.approved)}
            />
          ) : null}
          {item.status === 'pending' ? (
            <Button
              size="sm"
              variant="danger"
              icon="x"
              title={t.admin.reject}
              onPress={() => setRejecting(item)}
            />
          ) : null}
          {item.status === 'published' || item.status === 'hidden' ? (
            <Button
              size="sm"
              variant="outline"
              icon={item.status === 'published' ? 'eye-off' : 'eye'}
              title={item.status === 'published' ? t.admin.hide : t.admin.restore}
              onPress={() =>
                void run(
                  () => adminApi.setStoryHidden(item.id, item.status === 'published'),
                  item.status === 'published' ? t.admin.done.hidden : t.admin.done.restored,
                )
              }
            />
          ) : null}
          <Button
            size="sm"
            variant="danger"
            icon="trash-2"
            accessibilityLabel={t.admin.remove}
            onPress={() => void remove(item)}
          />
        </View>
      </AdminRow>
    );
  };

  return (
    <>
      <AdminList
        state={state}
        keyExtractor={(story) => story.id}
        renderItem={renderStory}
        header={
          <>
            <UnderlineTabs
              tabs={STATUSES}
              active={status}
              onChange={setStatus}
              getLabel={(item) => t.admin.status[item]}
            />
            <SearchField value={input} onChange={setInput} placeholder={t.admin.search} />
          </>
        }
      />
      <ReasonDialog
        visible={rejecting !== null}
        title={t.admin.rejectTitle}
        hint={t.admin.rejectHint}
        presets={t.admin.rejectReasons}
        confirmText={t.admin.reject}
        onSubmit={(reason) =>
          rejecting
            ? run(() => adminApi.rejectStory(rejecting.id, reason), t.admin.done.rejected)
            : Promise.resolve(false)
        }
        onClose={() => setRejecting(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
