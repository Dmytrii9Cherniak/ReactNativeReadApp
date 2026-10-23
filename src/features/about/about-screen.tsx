import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Icon, Screen, Text } from '@/shared/ui';

/** Макет, екран 10. */
export function AboutScreen() {
  const t = useT();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen gap={spacing.lg}>
      <View style={styles.logo}>
        <Icon name="book" size={26} color="primaryLight" />
      </View>
      <Text variant="display">{t.app.name}</Text>
      <Text variant="body">{t.about.description}</Text>
      <Button
        variant="outline"
        icon="shield"
        title={t.about.terms}
        onPress={() => router.push('/terms')}
      />
      <Text variant="caption" color="textFaint">
        {t.about.version(version)}
      </Text>
    </Screen>
  );
}

const LOGO_SIZE = 56;

const styles = StyleSheet.create({
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.primaryActive,
  },
});
