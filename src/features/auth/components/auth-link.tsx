import { Pressable, StyleSheet } from 'react-native';

import { spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface AuthLinkProps {
  question: string;
  action: string;
  onPress: () => void;
}

/** «Немає акаунту? Зареєструватися» */
export function AuthLink({ question, action, onPress }: AuthLinkProps) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <Text variant="caption">
        {`${question} `}
        <Text variant="caption" color="primaryLight" style={styles.action}>
          {action}
        </Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', padding: spacing.sm },
  action: { fontWeight: '700' },
});
