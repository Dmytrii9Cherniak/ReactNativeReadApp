import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/auth';
import { useWatchAd } from '@/features/progression';
import { LANGUAGES, useLanguageStore, useT } from '@/shared/i18n';
import { showMessage } from '@/shared/lib/dialogs';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { Button, Chip, Screen, Text } from '@/shared/ui';

import { BrightnessControl } from './components/brightness-control';
import { ReadingAppearance } from './components/reading-appearance';

/** Макет, екран 9 + вибір шрифту книг і мови. */
export function SettingsScreen() {
  const t = useT();
  const user = useCurrentUser();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const { watch, isWatching } = useWatchAd();

  // Реклама нараховує XP — тож лише для тих, хто увійшов
  const handleWatchAd = () => (user ? void watch() : router.push('/login'));

  return (
    <Screen gap={spacing.xl}>
      <BrightnessControl />
      <ReadingAppearance />

      <View style={styles.section}>
        <Text variant="sectionLabel">{t.settings.language}</Text>
        <View style={styles.chips}>
          {LANGUAGES.map((item) => (
            <Chip
              key={item}
              label={t.languages[item]}
              selected={item === language}
              onPress={() => setLanguage(item)}
            />
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.support]}>
        <Text variant="sectionLabel">{t.settings.support}</Text>
        <Button
          variant="warm"
          icon="heart"
          title={t.settings.watchAd}
          loading={isWatching}
          onPress={handleWatchAd}
        />
        <Button
          icon="heart"
          title={t.settings.donate}
          onPress={() => showMessage(t.settings.donate, t.settings.donateThanks)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  support: {
    paddingTop: spacing.lg,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
  },
});
