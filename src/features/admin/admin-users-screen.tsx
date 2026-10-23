import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/auth';
import { RankLabel } from '@/features/progression';
import { useT } from '@/shared/i18n';
import { Text, UnderlineTabs } from '@/shared/ui';

import { adminApi } from './admin.api';
import { AdminList } from './components/admin-list';
import { AdminRow } from './components/admin-row';
import { SearchField } from './components/search-field';
import { useAdminQuery } from './lib/use-admin-query';
import { useSearch } from './lib/use-search';

import type { AdminUser, UserFilter } from './types';

const FILTERS: readonly UserFilter[] = ['all', 'admins', 'blocked'];

export function AdminUsersScreen() {
  const t = useT();
  const me = useCurrentUser();
  const [filter, setFilter] = useState<UserFilter>('all');
  const { input, search, setInput } = useSearch();
  const { state } = useAdminQuery(`admin-users:${filter}:${search}`, () =>
    adminApi.listUsers({ filter, search }),
  );

  const renderUser = ({ item }: { item: AdminUser }) => (
    <AdminRow
      title={item.id === me?.id ? `${item.nickname} (${t.admin.users.you})` : item.nickname}
      subtitle={`${item.email} · ${t.roles[item.role]}`}
      meta={
        <View style={styles.meta}>
          <RankLabel xp={item.xp} factionId={item.factionId} />
          {item.blocked ? (
            <Text variant="caption" color="danger">
              {t.admin.users.blockedBecause(item.blockReason ?? '—')}
            </Text>
          ) : null}
        </View>
      }
      onPress={() => router.push({ pathname: '/admin/user/[id]', params: { id: item.id } })}
    />
  );

  return (
    <AdminList
      state={state}
      keyExtractor={(user) => user.id}
      renderItem={renderUser}
      header={
        <>
          <UnderlineTabs
            tabs={FILTERS}
            active={filter}
            onChange={setFilter}
            getLabel={(item) => t.admin.users.filters[item]}
          />
          <SearchField value={input} onChange={setInput} placeholder={t.admin.searchUsers} />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  meta: { gap: 2 },
});
