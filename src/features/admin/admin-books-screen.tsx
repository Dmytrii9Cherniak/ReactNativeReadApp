import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatRelativeTime, useT } from '@/shared/i18n';
import { confirm } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Button, UnderlineTabs } from '@/shared/ui';

import { adminApi } from './admin.api';
import { AdminList } from './components/admin-list';
import { AdminRow } from './components/admin-row';
import { SearchField } from './components/search-field';
import { StatusBadge } from './components/status-badge';
import { useAdminAction } from './lib/use-admin-action';
import { useAdminQuery } from './lib/use-admin-query';
import { useSearch } from './lib/use-search';

import type { AdminBook, ContentStatus } from './types';

const STATUSES: readonly ContentStatus[] = ['pending', 'published', 'hidden', 'rejected'];

/** Усі книги за станом: черга перевірки, бібліотека, приховані, відхилені. */
export function AdminBooksScreen() {
  const t = useT();
  const [status, setStatus] = useState<ContentStatus>('pending');
  const { input, search, setInput } = useSearch();
  const { state, refresh } = useAdminQuery(`admin-books:${status}:${search}`, () =>
    adminApi.listBooks({ status, search }),
  );
  const { run, isRunning } = useAdminAction(refresh);

  const pending = status === 'pending' && state.status === 'ready' ? state.value : [];

  const approveAll = async () => {
    const isConfirmed = await confirm({ title: t.admin.confirmApproveAll(pending.length) });

    if (isConfirmed) {
      await run(
        () => Promise.all(pending.map((book) => adminApi.approveBook(book.id))),
        t.admin.done.approved,
      );
    }
  };

  const renderBook = ({ item }: { item: AdminBook }) => (
    <AdminRow
      title={item.title}
      subtitle={[item.author, item.submittedBy?.nickname, formatRelativeTime(t, item.submittedAt)]
        .filter(Boolean)
        .join(' · ')}
      meta={<StatusBadge status={item.status} />}
      onPress={() => router.push({ pathname: '/admin/book/[id]', params: { id: item.id } })}
    />
  );

  return (
    <AdminList
      state={state}
      keyExtractor={(book) => book.id}
      renderItem={renderBook}
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
      listHeader={
        pending.length > 1 ? (
          <View style={styles.bulk}>
            <Button
              size="sm"
              variant="success"
              icon="check-circle"
              title={t.admin.approveAll(pending.length)}
              loading={isRunning}
              onPress={() => void approveAll()}
            />
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  bulk: { alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});
