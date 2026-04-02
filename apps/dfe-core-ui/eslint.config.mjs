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
  {
    // recharts rules
    plugins: ['eslint-plugin-react-perf'],
    rules: {
      /*
       * New object as prop creates a new reference on each render.
       * Recharts is optimized for this since 3.5.0.
       * You may enable this rule if you are using an older version,
       * or if you want to be extra cautious.
       */
      // 'react-perf/jsx-no-new-object-as-prop': 'error',
      'react-perf/jsx-no-new-array-as-prop': 'error',
      'react-perf/jsx-no-new-function-as-prop': 'error',
      'react-perf/jsx-no-jsx-as-prop': 'error',
    },
  },
  ...importScopeOverrides,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.next',
    'coverage/**',
  ]),
]);

export default eslintConfig;
