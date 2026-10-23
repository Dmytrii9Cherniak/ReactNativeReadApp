import Slider from '@react-native-community/slider';
import { StyleSheet } from 'react-native';

import { colors } from '@/shared/theme';

interface AppSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  disabled?: boolean;
  accessibilityLabel: string;
  onChange: (value: number) => void;
}

/** Повзунок у кольорах макета (олива). */
export function AppSlider({ onChange, ...props }: AppSliderProps) {
  return (
    <Slider
      {...props}
      onValueChange={onChange}
      minimumTrackTintColor={colors.primary}
      maximumTrackTintColor={colors.border}
      thumbTintColor={colors.primaryPale}
      style={styles.slider}
    />
  );
}

const styles = StyleSheet.create({
  slider: { width: '100%', height: 36 },
});
