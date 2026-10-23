import { StyleSheet, View } from 'react-native';

import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Chip } from '@/shared/ui';

import { getShelfLabel } from '../lib/shelf-labels';
import { useBookShelf, useShelvesStore } from '../shelves.store';

import type { Shelf } from '../types';

/** Порядок на сторінці книги — як у макеті. */
const PICKER_ORDER: Shelf[] = ['want', 'reading', 'read'];

/** Вибір полиці для книги. Повторне натискання на обрану полицю прибирає книгу з полиць. */
export function ShelfPicker({ bookId }: { bookId: string }) {
  const t = useT();
  const current = useBookShelf(bookId);
  const setShelf = useShelvesStore((s) => s.setShelf);

  const select = async (shelf: Shelf) => {
    try {
      await setShelf(bookId, shelf === current ? null : shelf);
    } catch (error) {
      notify.error(errorText(t, error));
    }
  };

  return (
    <View style={styles.row}>
      {PICKER_ORDER.map((shelf) => (
        <Chip
          key={shelf}
          label={getShelfLabel(t, shelf)}
          selected={shelf === current}
          onPress={() => select(shelf)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
