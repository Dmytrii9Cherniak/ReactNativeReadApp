import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Chip, Text, TextField } from '@/shared/ui';

const QUICK_AMOUNTS = [10, 50, 100, -10, -50];

interface XpDialogProps {
  visible: boolean;
  onSubmit: (amount: number, reason: string) => Promise<boolean>;
  onClose: () => void;
}

/** Нарахувати чи зняти досвід: готові суми або своя, і причина (її побачить користувач). */
export function XpDialog({ visible, onSubmit, onClose }: XpDialogProps) {
  const t = useT();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const close = () => {
    setAmount('');
    setReason('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    const value = Number(amount.replace(',', '.'));

    if (!Number.isFinite(value) || value === 0) {
      setError(t.admin.users.xpInvalid);

      return;
    }

    if (!reason.trim()) {
      setError(t.admin.reasonRequired);

      return;
    }

    setIsSending(true);

    const isDone = await onSubmit(value, reason.trim());

    setIsSending(false);

    if (isDone) {
      close();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t.common.cancel} />
      <View style={styles.layer}>
        <View style={styles.dialog}>
          <Text variant="screenTitle">{t.admin.users.adjustXp}</Text>
          <View style={styles.chips}>
            {QUICK_AMOUNTS.map((value) => (
              <Chip
                key={value}
                label={value > 0 ? `+${value}` : String(value)}
                selected={amount === String(value)}
                onPress={() => setAmount(String(value))}
              />
            ))}
          </View>
          <TextField
            value={amount}
            onChangeText={setAmount}
            placeholder={t.admin.users.xpAmount}
            keyboardType="numbers-and-punctuation"
          />
          <TextField value={reason} onChangeText={setReason} placeholder={t.admin.users.xpReason} />
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
              title={t.admin.users.apply}
              loading={isSending}
              onPress={() => void submit()}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    pointerEvents: 'box-none',
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
