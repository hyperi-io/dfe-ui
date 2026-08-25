import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';
import { importScopeOverrides } from './eslint/import-scope.mjs';

const ERROR = 'error';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Custom rules for this project.
    rules: {
      'no-console': ERROR,
      'no-alert': ERROR,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...importScopeOverrides,
  {
    // Mock generator: may import types from any scope; runs after import-scope overrides.
    files: ['src/core/config/api/endpoints/generator/**'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.next',
    'coverage/**',
    // Playwright output (generated, gitignored).
    'playwright-report/**',
    'test-results/**',
    'blob-report/**',
  ]),
]);

export default eslintConfig;
