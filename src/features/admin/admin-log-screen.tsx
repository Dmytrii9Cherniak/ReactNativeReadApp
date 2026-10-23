import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { formatRelativeTime, useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Chip, Text } from '@/shared/ui';

import { adminApi } from './admin.api';
import { AdminList } from './components/admin-list';
import { AdminRow } from './components/admin-row';
import { useAdminQuery } from './lib/use-admin-query';

import type { AuditEntry, AuditGroup } from './types';

type LogFilter = AuditGroup | 'all';

const FILTERS: readonly LogFilter[] = ['all', 'books', 'stories', 'users', 'broadcast'];

/** Журнал дій: хто з адмінів, що й коли змінив. */
export function AdminLogScreen() {
  const t = useT();
  const [filter, setFilter] = useState<LogFilter>('all');
  const { state } = useAdminQuery(`admin-log:${filter}`, () =>
    adminApi.listAudit(filter === 'all' ? undefined : filter),
  );

  const renderEntry = ({ item }: { item: AuditEntry }) => (
    <AdminRow
      title={`${item.admin.nickname} ${t.admin.log.actions[item.action]} «${item.target}»`}
      subtitle={formatRelativeTime(t, item.createdAt)}
      meta={
        item.details ? (
          <Text variant="caption" color="textSecondary">
            {item.details}
          </Text>
        ) : undefined
      }
    />
  );

  return (
    <AdminList
      state={state}
      keyExtractor={(entry) => entry.id}
      renderItem={renderEntry}
      header={
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}>
            {FILTERS.map((item) => (
              <Chip
                key={item}
                label={t.admin.log.filters[item]}
                selected={item === filter}
                onPress={() => setFilter(item)}
              />
            ))}
          </ScrollView>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  filters: { gap: spacing.sm, padding: spacing.lg },
});
