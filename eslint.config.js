// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylistic = require('@stylistic/eslint-plugin');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

/** Фічі спілкуються тільки через публічний API: `@/features/<name>`. */
const noDeepFeatureImports = {
  group: ['@/features/*/*'],
  message: 'Імпортуй з публічного API фічі: `@/features/<name>` (index.ts).',
};

/** На web `Alert` з react-native нічого не показує. */
const noRawAlert = {
  name: 'react-native',
  importNames: ['Alert'],
  message: 'Використовуй `confirm` / `showMessage` з `@/shared/lib/dialogs`.',
};

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,

  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts'],
  },

  {
    plugins: { '@stylistic': stylistic },
    rules: {
      // Порожній рядок перед і після `if` та перед `return`
      // (крім випадків, коли це перший рядок блоку).
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: '*' },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-restricted-imports': ['error', { paths: [noRawAlert], patterns: [noDeepFeatureImports] }],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  {
    // shared — нижній шар: нічого не знає про фічі
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [noRawAlert],
          patterns: [
            noDeepFeatureImports,
            { group: ['@/features', '@/features/*'], message: '`shared` не імпортує фічі.' },
          ],
        },
      ],
    },
  },

  {
    // Єдине місце, де дозволено Alert
    files: ['src/shared/lib/dialogs.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
