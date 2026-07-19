// @ts-check
import antfu from '@antfu/eslint-config'
import { globalIgnores } from 'eslint/config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  await antfu(
    {
      formatters: true,
      vue: true,
      pnpm: false,
      unocss: true,
    },
  ),
  globalIgnores([
    'dist',
    'node_modules',
    '.output',
    '.nuxt',
    '.storybook',
    'storybook-static',
    '.github',
    'coverage',
    '*.log',
    'nuxt.d.ts',
    '.output',
    '.DS_Store',
    '.vscode',
    '*.md',
    'package.json',
    'package-lock.json',
    'babel.config.js',
    'graphql',
    'types.ts',
    'generated',
    'components.d.ts',
    'icons.d.ts',
    'auto.d.ts',
    'src-tauri',
    'auto-imports.d.ts',
  ]),
  {
    rules: {
      'unocss/order': 'error', // or "error",
    },
  },
)
