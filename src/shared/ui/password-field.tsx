import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';

import { IconButton } from './icon-button';
import { TextField, type TextFieldProps } from './text-field';

/** Поле пароля з кнопкою «показати / сховати». */
export function PasswordField(props: Omit<TextFieldProps, 'secureTextEntry'>) {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      <TextField
        {...props}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, props.style]}
      />
      <View style={styles.toggle}>
        <IconButton
          icon={isVisible ? 'eye-off' : 'eye'}
          size={18}
          color="textMuted"
          accessibilityLabel={isVisible ? t.auth.hidePassword : t.auth.showPassword}
          onPress={() => setIsVisible((value) => !value)}
        />
      </View>
    </View>
  );
}

const TOGGLE_SPACE = 44;

const styles = StyleSheet.create({
  input: { paddingRight: TOGGLE_SPACE },
  toggle: {
    position: 'absolute',
    top: 0,
    right: spacing.xs,
    bottom: 0,
    justifyContent: 'center',
  },
});
