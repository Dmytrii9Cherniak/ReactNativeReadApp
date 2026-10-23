import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Chip, Text, TextField } from '@/shared/ui';

interface ReasonDialogProps {
  visible: boolean;
  title: string;
  hint: string;
  /** Готові причини одним дотиком (відхилення) */
  presets?: readonly string[];
  confirmText: string;
  onSubmit: (reason: string) => Promise<boolean>;
  onClose: () => void;
}

/** Діалог «вкажіть причину» — для відхилення й блокування. */
export function ReasonDialog({
  visible,
  title,
  hint,
  presets = [],
  confirmText,
  onSubmit,
  onClose,
}: ReasonDialogProps) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const close = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!reason.trim()) {
      setError(t.admin.reasonRequired);

      return;
    }

    setIsSending(true);

    const isDone = await onSubmit(reason.trim());

    setIsSending(false);

    if (isDone) {
      close();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t.common.cancel} />
      <View style={styles.layer}>
        <ScrollView style={styles.dialog} contentContainerStyle={styles.content}>
          <Text variant="screenTitle">{title}</Text>
          <Text variant="caption">{hint}</Text>
          {presets.length > 0 ? (
            <View style={styles.presets}>
              {presets.map((preset) => (
                <Chip
                  key={preset}
                  label={preset}
                  selected={reason === preset}
                  onPress={() => setReason(preset)}
                />
              ))}
            </View>
          ) : null}
          <TextField
            value={reason}
            onChangeText={setReason}
            placeholder={t.admin.reasonPlaceholder}
            multiline
          />
          {error ? (
            <Text variant="caption" color="danger">
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              variant="outline"
              title={t.common.cancel}
              onPress={close}
              style={styles.action}
            />
            <Button
              variant="danger"
              title={confirmText}
              loading={isSending}
              onPress={() => void submit()}
              style={styles.action}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const DIALOG_MAX_WIDTH = 440;

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  layer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    // Клік повз діалог проходить до фону — він закриває діалог
    pointerEvents: 'box-none',
  },
  dialog: {
    flexGrow: 0,
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
  },
  content: { gap: spacing.md, padding: spacing.xl },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
