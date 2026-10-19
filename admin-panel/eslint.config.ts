import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: globals.browser,
      // Для <script lang="ts"> внутри .vue
      parserOptions: { parser: tseslint.parser },
    },
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
    },
  },
  prettierConfig,
]
