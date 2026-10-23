import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, spacing } from '@/shared/theme';

import { Text } from './text';

interface UnderlineTabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  getLabel: (tab: T) => string;
}

/** Вкладки з підкресленням активної — «Мої книги», «Перевірка надісланого». */
export function UnderlineTabs<T extends string>({
  tabs,
  active,
  onChange,
  getLabel,
}: UnderlineTabsProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = tab === active;

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab)}
            style={[styles.tab, isActive && styles.activeTab]}>
            <Text variant="label" color={isActive ? 'primaryLight' : 'textMuted'}>
              {getLabel(tab)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.accent,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: colors.primary },
});
