/**
 * Import scope rule: only allow imports to current scope or @/core.
 *
 * - Feature scopes (@/Schemas, @/Sources, @/Rules, @/Settings) may only import
 *   from their own scope or @/core.
 * - Core (@/core) may only import from @/core.
 * - Relative parent imports (../) are not allowed; use @/ path aliases.
 */

const ERROR = 'error';

export const SCOPES = ['Schemas', 'Sources', 'Rules', 'Settings'];

const otherScopes = (current) =>
  SCOPES.filter((s) => s !== current).flatMap((s) => [`@/${s}`, `@/${s}/**`]);

const RULE_ID = 'no-restricted-imports';

const noRelativeParentImports = {
  group: ['../**'],
  message: 'Relative parent imports (../) are not allowed. Use @/ path aliases instead.',
};

const scopeImportOverrides = SCOPES.map((scope) => ({
  files: [`src/${scope}/**/*.{ts,tsx}`],
  rules: {
    [RULE_ID]: [
      ERROR,
      {
        patterns: [
          {
            group: otherScopes(scope),
            message: `Imports from other scopes are not allowed. Use only @/${scope} or @/core.`,
          },
          noRelativeParentImports,
        ],
      },
    ],
  },
}));

const coreImportOverride = {
  files: ['src/core/**/*.{ts,tsx}'],
  rules: {
    [RULE_ID]: [
      ERROR,
      {
        patterns: [
          {
            group: SCOPES.flatMap((s) => [`@/${s}`, `@/${s}/**`]),
            message: 'Core must not import from feature scopes. Use only @/core.',
          },
          noRelativeParentImports,
        ],
      },
    ],
  },
};

/**
 * Test wrapper may import across scopes - it needs to wrap providers/components
 * from different feature areas for tests.
 */
const testWrapperException = {
  files: ['src/core/utils/test-utils/**/*.{ts,tsx}'],
  rules: {
    [RULE_ID]: 'off',
  },
};

/**
 * App and other src files: only restrict relative parent imports.
 */
const appAndOtherImportsOverride = {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    [RULE_ID]: [
      ERROR,
      {
        patterns: [noRelativeParentImports],
      },
    ],
  },
};

/** Rule ID for import scope restrictions. */
export { RULE_ID };

/** ESLint config overrides for import scope restrictions. */
export const importScopeOverrides = [
  appAndOtherImportsOverride,
  ...scopeImportOverrides,
  coreImportOverride,
  testWrapperException,
];
