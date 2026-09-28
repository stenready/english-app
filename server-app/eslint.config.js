import js from '@eslint/js'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
    rules: {
      // Express различает error-handler по 4 аргументам, _next обязателен
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Последним — отключает правила, конфликтующие с Prettier
  prettierConfig,
]
