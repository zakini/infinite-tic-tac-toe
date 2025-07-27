import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import { type FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import { type Linter } from 'eslint'
import tailwind from 'eslint-plugin-better-tailwindcss'
import tseslint from 'typescript-eslint'

// eslint configs are kinda weirdly structured
// see: https://github.com/typescript-eslint/typescript-eslint/issues/8613
type Config = Linter.Config | FlatConfig.Config

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // nextjs defaults
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // we use eslint instead of next lint so that root files are linted too
  // eslint doesn't know to ignore this generated folder though
  { ignores: ['.next'] },

  // next/typescript includes recommended, so just add the type checked parts here
  ...tseslint.config(
    // eslint-disable-next-line import/no-named-as-default-member
    tseslint.configs.recommendedTypeCheckedOnly,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
  ),
  // and ignore the type checked parts for non-ts files
  {
    // eslint-disable-next-line import/no-named-as-default-member
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.mjs'],
  },

  // code style
  stylistic.configs['recommended-flat'],
  {
    plugins: {
      'better-tailwindcss': tailwind,
    },
    rules: {
      ...tailwind.configs['recommended-error'].rules,
    },
  },

  // the bikeshed
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-line' }],
      'max-len': ['error', { code: 100 }],
      '@stylistic/quotes': ['error', 'single'],
    },
  },
  ...compat.extends('plugin:import/recommended', 'plugin:import/typescript'),
  {
    rules: {
      'import/no-unused-modules': ['warn', {
        unusedExports: true,
        ignoreExports: [
          // configs
          '*.config.{ts,js,mjs}',
          'instrumentation.ts',
          'instrumentation-*.ts',

          // entrypoints
          'app/**/page.tsx',
          'app/**/layout.tsx',
          'app/global-error.tsx',
        ],
      }],
      'import/newline-after-import': 'error',
      'import/order': ['error', {
        'alphabetize': { order: 'asc', orderImportKind: 'asc', caseInsensitive: true },
        'newlines-between': 'never',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
] satisfies Config[]

export default eslintConfig
