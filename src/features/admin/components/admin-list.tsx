import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import type { AsyncState } from '@/shared/hooks/use-async';
import { useT } from '@/shared/i18n';
import { colors } from '@/shared/theme';
import { CenteredMessage, Loader } from '@/shared/ui';

import type { ReactElement } from 'react';

interface AdminListProps<T> {
  state: AsyncState<T[]>;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  /** Вкладки, пошук — над списком; не зникають під час завантаження */
  header?: ReactElement;
  listHeader?: ReactElement;
}

/** Список адмінки зі станами «завантаження / помилка / порожньо». */
export function AdminList<T>({
  state,
  renderItem,
  keyExtractor,
  header,
  listHeader,
}: AdminListProps<T>) {
  const t = useT();

  return (
    <View style={styles.screen}>
      <View style={styles.column}>{header}</View>
      {state.status === 'loading' ? (
        <Loader />
      ) : state.status === 'error' ? (
        <CenteredMessage title={t.common.loadError} description={state.message} />
      ) : (
        <FlatList
          data={state.value}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<CenteredMessage title={t.admin.empty} />}
          contentContainerStyle={styles.content}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', flexGrow: 1 },
});
