import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing, type ReaderPaletteId } from '@/shared/theme';
import { Chip, Text } from '@/shared/ui';

import { useReaderLook } from '../hooks/use-reader-look';
import { useReadingStyle } from '../hooks/use-reading-style';
import { READER_ALIGN_ORDER, READER_MARGIN_ORDER } from '../lib/reader-layout';
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
  const look = useReaderLook();
  const theme = useSettingsStore((s) => s.readerTheme);
  const margin = useSettingsStore((s) => s.readerMargin);
  const align = useSettingsStore((s) => s.readerAlign);
  const setTheme = useSettingsStore((s) => s.setReaderTheme);
  const setMargin = useSettingsStore((s) => s.setReaderMargin);
  const setAlign = useSettingsStore((s) => s.setReaderAlign);

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

      <ChipRow
        label={t.settings.readerTheme}
        options={THEMES}
        selected={theme}
        getLabel={(item) => t.settings.themes[item]}
        onSelect={setTheme}
      />
      <ChipRow
        label={t.settings.margins}
        options={READER_MARGIN_ORDER}
        selected={margin}
        getLabel={(item) => t.settings.marginSizes[item]}
        onSelect={setMargin}
      />
      <ChipRow
        label={t.settings.align}
        options={READER_ALIGN_ORDER}
        selected={align}
        getLabel={(item) => t.settings.aligns[item]}
        onSelect={setAlign}
      />

      <View
        style={[
          styles.preview,
          { backgroundColor: look.palette.background, paddingHorizontal: look.paddingHorizontal },
        ]}>
        <Text
          variant="reading"
          style={[readingStyle, { color: look.palette.text, textAlign: look.textAlign }]}>
          {t.settings.preview}
        </Text>
      </View>
    </View>
  );
}

const THEMES: readonly ReaderPaletteId[] = ['zone', 'sepia', 'night'];

interface ChipRowProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T;
  getLabel: (option: T) => string;
  onSelect: (option: T) => void;
}

function ChipRow<T extends string>({
  label,
  options,
  selected,
  getLabel,
  onSelect,
}: ChipRowProps<T>) {
  return (
    <View style={styles.section}>
      <Text variant="sectionLabel">{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option}
            label={getLabel(option)}
            selected={option === selected}
            onPress={() => onSelect(option)}
          />
        ))}
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
