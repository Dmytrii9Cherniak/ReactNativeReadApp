import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { TextField } from '@/shared/ui';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <TextField
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
});
