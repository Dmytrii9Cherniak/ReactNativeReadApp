import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { errorText, useT } from '@/shared/i18n';
import { confirm, notify } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Button, Card, PasswordField, Screen, Text, TextField } from '@/shared/ui';

import { useAuthStore, useCurrentUser } from './auth.store';
import { validateEmail, validateNewPassword, validateNickname } from './lib/validation';

/** Акаунт: нік, пошта, пароль, видалення. Кожен блок зберігається окремо. */
export function AccountScreen() {
  const t = useT();
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Screen gap={spacing.lg}>
      <NicknameCard initial={user.nickname} />
      <EmailCard current={user.email} />
      <PasswordCard />
      <DeleteCard />
      <Text variant="caption" color="textFaint" style={styles.center}>
        {`${user.email} · ${t.roles[user.role]}`}
      </Text>
    </Screen>
  );
}

/** Спільне для блоків: перевірка → запит → сповіщення про результат. */
function useAccountAction() {
  const t = useT();
  const [isBusy, setIsBusy] = useState(false);

  const run = async (invalid: string | null, task: () => Promise<void>, success: string) => {
    if (invalid) {
      notify.error(invalid);

      return false;
    }

    setIsBusy(true);

    try {
      await task();
      notify.success(success);

      return true;
    } catch (error) {
      notify.error(errorText(t, error));

      return false;
    } finally {
      setIsBusy(false);
    }
  };

  return { run, isBusy };
}

function NicknameCard({ initial }: { initial: string }) {
  const t = useT();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [nickname, setNickname] = useState(initial);
  const { run, isBusy } = useAccountAction();

  return (
    <Card>
      <Text variant="sectionLabel">{t.account.nickname}</Text>
      <TextField value={nickname} onChangeText={setNickname} maxLength={32} />
      <Button
        title={t.account.save}
        loading={isBusy}
        disabled={nickname.trim() === initial}
        onPress={() =>
          void run(
            validateNickname(t, nickname),
            () => updateProfile({ nickname: nickname.trim() }),
            t.account.saved,
          )
        }
      />
    </Card>
  );
}

function EmailCard({ current }: { current: string }) {
  const t = useT();
  const changeEmail = useAuthStore((s) => s.changeEmail);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, isBusy } = useAccountAction();

  const save = async () => {
    const isDone = await run(
      validateEmail(t, email),
      () => changeEmail({ email: email.trim(), password }),
      t.account.emailChanged,
    );

    if (isDone) {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Card>
      <Text variant="sectionLabel">{t.account.email}</Text>
      <Text variant="body" color="text">
        {current}
      </Text>
      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder={t.account.newEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <PasswordField
        value={password}
        onChangeText={setPassword}
        placeholder={t.account.currentPassword}
        autoComplete="current-password"
      />
      <Button
        variant="outline"
        title={t.account.changeEmail}
        loading={isBusy}
        disabled={!email || !password}
        onPress={() => void save()}
      />
    </Card>
  );
}

function PasswordCard() {
  const t = useT();
  const changePassword = useAuthStore((s) => s.changePassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { run, isBusy } = useAccountAction();

  const save = async () => {
    const isDone = await run(
      validateNewPassword(t, newPassword),
      () => changePassword({ currentPassword, newPassword }),
      t.account.passwordChanged,
    );

    if (isDone) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <Card>
      <Text variant="sectionLabel">{t.account.password}</Text>
      <PasswordField
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder={t.account.currentPassword}
        autoComplete="current-password"
      />
      <PasswordField
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t.account.newPassword}
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Button
        variant="outline"
        title={t.account.changePassword}
        loading={isBusy}
        disabled={!currentPassword || !newPassword}
        onPress={() => void save()}
      />
    </Card>
  );
}

function DeleteCard() {
  const t = useT();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [password, setPassword] = useState('');
  const { run, isBusy } = useAccountAction();

  const remove = async () => {
    const isConfirmed = await confirm({
      title: t.account.deleteConfirm,
      message: t.account.deleteConfirmHint,
      confirmText: t.account.deleteAccount,
      destructive: true,
    });

    // Після видалення сесія закінчується — закриті екрани зникають самі
    if (isConfirmed) {
      await run(null, () => deleteAccount(password), t.account.deleted);
    }
  };

  return (
    <Card>
      <Text variant="sectionLabel" color="danger">
        {t.account.danger}
      </Text>
      <Text variant="caption">{t.account.deleteHint}</Text>
      <PasswordField
        value={password}
        onChangeText={setPassword}
        placeholder={t.account.currentPassword}
        autoComplete="current-password"
      />
      <Button
        variant="danger"
        icon="trash-2"
        title={t.account.deleteAccount}
        loading={isBusy}
        disabled={!password}
        onPress={() => void remove()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
