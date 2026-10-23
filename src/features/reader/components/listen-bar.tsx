import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { Button, Chip, Text } from '@/shared/ui';

import { SPEECH_RATES } from '../hooks/use-read-aloud';

interface ListenBarProps {
  rate: number;
  onRateChange: (rate: number) => void;
  onStop: () => void;
}

/** Плеєр озвучення внизу рідера: швидкість і «Зупинити». */
export function ListenBar({ rate, onRateChange, onStop }: ListenBarProps) {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
      <Text variant="caption">{t.reader.speed}</Text>
      <View style={styles.rates}>
        {SPEECH_RATES.map((value) => (
          <Chip
            key={value}
            label={`${value}×`}
            selected={value === rate}
            onPress={() => onRateChange(value)}
          />
        ))}
      </View>
      <Button
        size="sm"
        variant="danger"
        icon="square"
        accessibilityLabel={t.reader.stopListening}
        onPress={onStop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  rates: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
