import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';

import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

import type { ErrorBoundaryProps } from 'expo-router';

/**
 * Запасний екран, якщо під час рендеру щось упало: замість білого екрана — пояснення,
 * «Спробувати ще раз» і «На головну». Підключається в layout: `export { ErrorBoundary }`.
 * Подробиці помилки користувачу не показуємо.
 */
export function ErrorFallback({ retry }: ErrorBoundaryProps) {
  const t = useT();

  const goHome = async () => {
    await retry();

    try {
      router.replace('/');
    } catch {
      // Навігатор ще не змонтований (помилка в кореневому layout) — лишаємось тут
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="alert-triangle" size={28} color="warm" />
      <Text variant="screenTitle">{t.common.crashTitle}</Text>
      <Text variant="caption" style={styles.hint}>
        {t.common.crashHint}
      </Text>
      <View style={styles.actions}>
        <Button title={t.common.retry} icon="refresh-cw" onPress={() => void retry()} />
        <Button title={t.common.home} variant="outline" icon="home" onPress={() => void goHome()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  hint: { textAlign: 'center', maxWidth: 320 },
  actions: { width: '100%', maxWidth: 320, gap: spacing.sm, marginTop: spacing.md },
});
