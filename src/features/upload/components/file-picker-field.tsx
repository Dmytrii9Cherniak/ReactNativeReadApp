import { Pressable, StyleSheet } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Icon, Text, type IconName } from '@/shared/ui';

interface FilePickerFieldProps {
  icon: IconName;
  label: string;
  /** Ім'я обраного файлу */
  fileName: string | null;
  onPress: () => void;
}

/** Пунктирне поле «Обрати файл…» з макета; після вибору показує ім'я файлу. */
export function FilePickerField({ icon, label, fileName, onPress }: FilePickerFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.field, fileName && styles.picked, pressed && styles.pressed]}>
      <Icon name={fileName ? 'check-circle' : icon} color={fileName ? 'success' : 'primaryLight'} />
      <Text
        variant="caption"
        color={fileName ? 'text' : 'primaryLight'}
        numberOfLines={1}
        style={styles.label}>
        {fileName ?? label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: 'dashed',
    borderColor: colors.borderActive,
  },
  picked: { borderStyle: 'solid', borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  label: { flex: 1 },
});
