import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, prettierPlugin },
    extends: [
      'js/recommended',
      'plugin:@typescript-eslint/recommended',
      'eslint:recommended',
      'plugin:prettier',
      'prettier/recommended'
    ],
    language: '@typescript-eslint/parser',
    languageOptions: { globals: globals.node }
  },
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]);
