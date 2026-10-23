import { ScrollView, StyleSheet } from 'react-native';

import { BrightnessControl, ReadingAppearance } from '@/features/settings';
import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { BottomSheet, Button } from '@/shared/ui';

interface AppearancePanelProps {
  visible: boolean;
  onClose: () => void;
}

/** Панель «Aa»: яскравість, розмір, шрифт, тема, поля — текст змінюється одразу. */
export function AppearancePanel({ visible, onClose }: AppearancePanelProps) {
  const t = useT();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.reader.appearance}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrightnessControl />
        <ReadingAppearance />
        <Button title={t.common.done} onPress={onClose} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
