import { StyleSheet } from 'react-native';

import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Card, Screen, Text } from '@/shared/ui';

/** Макет, екран 11: Умови використання та політика контенту. */
export function TermsScreen() {
  const t = useT();

  return (
    <Screen gap={spacing.lg}>
      {t.terms.items.map((item, index) => (
        <Text key={item.title} variant="body">
          <Text variant="body" color="text" style={styles.bold}>
            {`${index + 1}. ${item.title} `}
          </Text>
          {item.text}
        </Text>
      ))}
      <Card>
        <Text variant="caption" style={styles.italic}>
          {t.terms.disclaimer}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
});
