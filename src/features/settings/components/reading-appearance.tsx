import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Chip, Text } from '@/shared/ui';

import { useReadingStyle } from '../hooks/use-reading-style';
import { READING_FONTS } from '../lib/reading-fonts';
import { TEXT_SIZE } from '../lib/text-size';
import { useSettingsStore } from '../settings.store';
import { AppSlider } from './app-slider';

/** Розмір тексту «A — A», вибір шрифту і живий приклад. І в налаштуваннях, і в рідері. */
export function ReadingAppearance() {
  const t = useT();
  const fontSize = useSettingsStore((s) => s.readerFontSize);
  const font = useSettingsStore((s) => s.readerFont);
  const setFontSize = useSettingsStore((s) => s.setReaderFontSize);
  const setFont = useSettingsStore((s) => s.setReaderFont);
  const readingStyle = useReadingStyle();

  return (
    <View style={styles.container}>
      <View>
        <Text variant="sectionLabel">{t.settings.textSize}</Text>
        <AppSlider
          accessibilityLabel={t.settings.textSize}
          value={fontSize}
          minimumValue={TEXT_SIZE.min}
          maximumValue={TEXT_SIZE.max}
          step={TEXT_SIZE.step}
          onChange={setFontSize}
        />
        <View style={styles.scale}>
          <Text variant="caption">A</Text>
          <Text variant="caption">{`${fontSize} pt`}</Text>
          <Text variant="body" style={styles.bigA}>
            A
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="sectionLabel">{t.settings.font}</Text>
        <View style={styles.chips}>
          {READING_FONTS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={item.id === font}
              onPress={() => setFont(item.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.preview}>
        <Text variant="reading" style={readingStyle}>
          {t.settings.preview}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl },
  scale: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bigA: { fontSize: 20 },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preview: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
});
