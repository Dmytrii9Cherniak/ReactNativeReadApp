import { Pressable, StyleSheet, View } from 'react-native';

import { DEMO_ACCOUNTS } from '@/mock-backend';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

interface DemoAccountsProps {
  onPick: (email: string, password: string) => void;
}

/** Лише в демо-режимі: тестові акаунти для кожної ролі — натиснув і поля заповнились. */
export function DemoAccounts({ onPick }: DemoAccountsProps) {
  const t = useT();

  return (
    <Card>
      <Text variant="sectionLabel">{t.auth.demoAccounts}</Text>
      {DEMO_ACCOUNTS.map((account) => (
        <Pressable
          key={account.email}
          accessibilityRole="button"
          onPress={() => onPick(account.email, account.password)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.role}>
            <Text variant="caption" color="primaryLight">
              {t.roles[account.role]}
            </Text>
          </View>
          <Text variant="caption" color="textSecondary" style={styles.credentials}>
            {`${account.email} · ${account.password}`}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
  },
  role: {
    minWidth: 88,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryActive,
  },
  credentials: { flex: 1 },
  pressed: { opacity: 0.7 },
});
