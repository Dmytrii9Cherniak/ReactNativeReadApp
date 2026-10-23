import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/shared/i18n';
import { useDialogsStore, type Notice, type NoticeType } from '@/shared/lib/dialogs.store';
import { borderWidth, colors, radius, spacing, type ColorToken } from '@/shared/theme';

import { Button } from './button';
import { Icon, type IconName } from './icon';
import { Text } from './text';

const NOTICE_LOOK: Record<NoticeType, { icon: IconName; color: ColorToken }> = {
  success: { icon: 'check-circle', color: 'success' },
  error: { icon: 'alert-circle', color: 'danger' },
  info: { icon: 'info', color: 'primaryLight' },
};

const NOTICE_MAX_WIDTH = 440;
const DIALOG_MAX_WIDTH = 380;

/**
 * Сповіщення (зверху) і діалог підтвердження. Один раз у кореневому layout;
 * викликаються через `notify` / `confirm` з `shared/lib/dialogs`.
 */
export function NotificationHost() {
  return (
    <>
      <Notices />
      <ConfirmDialog />
    </>
  );
}

function Notices() {
  const notices = useDialogsStore((s) => s.notices);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.notices, { top: insets.top + spacing.md }]}>
      {notices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </View>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  const t = useT();
  const dismiss = useDialogsStore((s) => s.dismiss);
  const look = NOTICE_LOOK[notice.type];

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(160)}
      layout={LinearTransition}
      style={styles.noticeWrap}>
      <Pressable
        accessibilityRole="alert"
        accessibilityHint={t.common.close}
        onPress={() => dismiss(notice.id)}
        style={[styles.notice, { borderLeftColor: colors[look.color] }]}>
        <Icon name={look.icon} size={18} color={look.color} />
        <View style={styles.noticeText}>
          <Text variant="label">{notice.title}</Text>
          {notice.message ? <Text variant="caption">{notice.message}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ConfirmDialog() {
  const t = useT();
  const request = useDialogsStore((s) => s.confirmRequest);
  const answer = useDialogsStore((s) => s.answer);

  return (
    <Modal
      visible={request !== null}
      transparent
      animationType="fade"
      onRequestClose={() => answer(false)}>
      <Pressable
        style={styles.backdrop}
        onPress={() => answer(false)}
        accessibilityLabel={t.common.cancel}
      />
      {request ? (
        <View style={styles.dialogLayer}>
          <View style={styles.dialog} accessibilityRole="alert">
            <Text variant="screenTitle">{request.title}</Text>
            {request.message ? <Text variant="body">{request.message}</Text> : null}
            <View style={styles.actions}>
              <Button
                variant="outline"
                title={request.cancelText ?? t.common.cancel}
                onPress={() => answer(false)}
                style={styles.action}
              />
              <Button
                variant={request.destructive ? 'danger' : 'primary'}
                title={request.confirmText ?? t.common.confirm}
                onPress={() => answer(true)}
                style={styles.action}
              />
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  notices: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    // Повз сповіщення натискання проходять до екрана
    pointerEvents: 'box-none',
  },
  noticeWrap: { width: '100%', maxWidth: NOTICE_MAX_WIDTH },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderLeftWidth: 3,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
  },
  noticeText: { flex: 1, gap: 2 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  dialogLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    // Клік повз діалог проходить до фону — він закриває діалог
    pointerEvents: 'box-none',
  },
  dialog: {
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1 },
});
