import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { colors, fonts } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.surfaceRaised}
      rippleColor={colors.surfaceRaised}
      iconColor={{ default: colors.muted, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.muted, fontFamily: fonts.mono },
        selected: { color: colors.primary, fontFamily: fonts.mono },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Бібліотека</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Налаштування</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
