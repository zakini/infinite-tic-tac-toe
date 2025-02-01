import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import tailwind from 'eslint-plugin-tailwindcss'

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
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.mjs'],
  },

  // code style
  stylistic.configs['recommended-flat'],
  ...tailwind.configs['flat/recommended'],

  // the bikeshed
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
] satisfies Config[]

export default eslintConfig
