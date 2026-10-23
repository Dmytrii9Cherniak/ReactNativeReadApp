import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { confirm, notify } from '@/shared/lib/dialogs';
import { goBack } from '@/shared/lib/navigation';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Icon, Screen, Text, TextField } from '@/shared/ui';

import { adminApi } from './admin.api';
import { useAdminAction } from './lib/use-admin-action';

/** Оголошення всім користувачам — приходить у «Сповіщення». З попереднім переглядом. */
export function AdminBroadcastScreen() {
  const t = useT();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { run, isRunning } = useAdminAction(goBack);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      notify.error(t.admin.broadcast.required);

      return;
    }

    if (await confirm({ title: t.admin.broadcast.confirm, confirmText: t.admin.broadcast.send })) {
      await run(() => adminApi.broadcast({ title, message }), t.admin.done.broadcast);
    }
  };

  return (
    <Screen gap={spacing.md}>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder={t.admin.broadcast.title}
        maxLength={80}
      />
      <TextField
        value={message}
        onChangeText={setMessage}
        placeholder={t.admin.broadcast.message}
        multiline
        maxLength={500}
      />

      <Text variant="sectionLabel">{t.admin.broadcast.preview}</Text>
      <View style={styles.preview}>
        <Icon name="bell" color="primaryLight" />
        <View style={styles.previewText}>
          <Text variant="label">{title.trim() || t.admin.broadcast.title}</Text>
          <Text variant="caption">{message.trim() || t.admin.broadcast.message}</Text>
        </View>
      </View>

      <Button
        icon="send"
        title={t.admin.broadcast.send}
        loading={isRunning}
        onPress={() => void send()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
  },
  previewText: { flex: 1, gap: 2 },
});
