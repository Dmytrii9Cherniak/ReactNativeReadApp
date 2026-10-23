import { View } from 'react-native';

import { useT } from '@/shared/i18n';
import { Text } from '@/shared/ui';

import { AppSlider } from './app-slider';
import { useBrightness } from '../hooks/use-brightness';

const MIN_BRIGHTNESS = 0.05;

export function BrightnessControl() {
  const t = useT();
  const { isAvailable, brightness, setBrightness } = useBrightness();

  return (
    <View>
      <Text variant="sectionLabel">{t.settings.brightness}</Text>
      <AppSlider
        accessibilityLabel={t.settings.brightness}
        value={brightness}
        minimumValue={MIN_BRIGHTNESS}
        maximumValue={1}
        disabled={!isAvailable}
        onChange={setBrightness}
      />
      {isAvailable ? null : (
        <Text variant="caption" color="textFaint">
          {t.settings.brightnessWeb}
        </Text>
      )}
    </View>
  );
}
