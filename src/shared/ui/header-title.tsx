import type { TypographyVariant } from '@/shared/theme';

import { Text } from './text';

interface HeaderTitleProps {
  children: string;
  variant?: Extract<TypographyVariant, 'appTitle' | 'screenTitle'>;
}

/** Заголовок у шапці навігатора — великими літерами, як у макеті. */
export function HeaderTitle({ children, variant = 'screenTitle' }: HeaderTitleProps) {
  return (
    <Text variant={variant} numberOfLines={1}>
      {children}
    </Text>
  );
}
