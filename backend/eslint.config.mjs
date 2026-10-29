import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'typescript-eslint';

export default defineConfig([globalIgnores(['dist/**']), ...ts.configs.recommended]);
