import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/shared/theme';

/** Екрани входу. Доступні лише гостям — гард у кореневому _layout (Stack.Protected). */
export default function AuthLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="login" options={{ title: 'Вхід' }} />
      <Stack.Screen name="register" options={{ title: 'Реєстрація' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Підтвердження' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Відновлення' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Новий пароль' }} />
    </Stack>
  );
}
