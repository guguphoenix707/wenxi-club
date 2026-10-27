import { defineConfig } from 'eslint/config';
import ts from 'eslint-config-next/typescript';
export default defineConfig([...ts, { ignores: ['dist/**'] }]);
