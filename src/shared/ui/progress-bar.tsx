import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/theme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const percent = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 2, backgroundColor: colors.border },
  fill: { height: '100%', backgroundColor: colors.primary },
});
