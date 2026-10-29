import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  globalIgnores(['dist/**', '.next/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ts.configs.recommended],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended],
    settings: {
      'jsx-a11y': {
        components: { Link: 'a', NavLink: 'a' },
      },
    },
    rules: {
      'jsx-a11y/anchor-is-valid': ['error', { specialLink: ['to'] }],
    },
  },
]);
