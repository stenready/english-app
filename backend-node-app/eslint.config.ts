import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['node_modules/**', 'dist/**', 'src/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      // Функции всегда с телом в {}: const fn = () => { return … }.
      // Только стрелки, присвоенные константе; колбэки (map, computed, watch…) не трогает
      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclarator > ArrowFunctionExpression[body.type!="BlockStatement"]',
          message: 'Пишите функцию с телом в {}: const fn = () => { return … }',
        },
      ],
      // Express различает error-handler по 4 аргументам, _next обязателен
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Последним — отключает правила, конфликтующие с Prettier
  prettierConfig,
]
