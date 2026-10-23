import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrightnessControl, ReadingAppearance } from '@/features/settings';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Text } from '@/shared/ui';

interface AppearancePanelProps {
  visible: boolean;
  onClose: () => void;
}

/** Панель «Aa» знизу рідера: яскравість, розмір і шрифт — текст змінюється одразу. */
export function AppearancePanel({ visible, onClose }: AppearancePanelProps) {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t.common.done} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="screenTitle">{t.reader.appearance}</Text>
          <BrightnessControl />
          <ReadingAppearance />
          <Button title={t.common.done} onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '75%',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: { gap: spacing.xl, padding: spacing.xl },
});
