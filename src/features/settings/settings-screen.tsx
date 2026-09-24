import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { env } from '@/config/env';
import { useBooks } from '@/features/library';
import { spacing } from '@/shared/theme';
import { InfoRow, Screen, ScreenHeader, Text } from '@/shared/ui';

export function SettingsScreen() {
  const books = useBooks();

  return (
    <Screen>
      <ScreenHeader eyebrow="Система" title="Налаштування" />

      <View style={styles.section}>
        <Text variant="heading">Бібліотека</Text>
        <InfoRow label="Книг" value={String(books.length)} />
      </View>

      <View style={styles.section}>
        <Text variant="heading">Про додаток</Text>
        <InfoRow label="Версія" value={Constants.expoConfig?.version ?? '—'} />
        <InfoRow label="Середовище" value={env.appEnv} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: spacing.xl },
});
