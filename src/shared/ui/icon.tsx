import { Feather } from '@expo/vector-icons';

import { colors, type ColorToken } from '@/shared/theme';

import type { ComponentProps } from 'react';

/** Лінійні іконки Feather — як у макеті. Назви: https://feathericons.com */
export type IconName = ComponentProps<typeof Feather>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorToken;
}

export function Icon({ name, size = 18, color = 'textMuted' }: IconProps) {
  return <Feather name={name} size={size} color={colors[color]} />;
}
