/**
 * @vitest-environment node
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { ESLint } from 'eslint';
import { importScopeOverrides, RULE_ID, SCOPES } from './import-scope.mjs';

const SRC_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../src');
const SCOPE_EXCLUDED_DIRS = new Set(['app', 'core', 'types']);

const expectedScopesFromFilesystem = () =>
  readdirSync(SRC_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !SCOPE_EXCLUDED_DIRS.has(name))
    .sort();

const createLinter = async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
          parser: (await import('@typescript-eslint/parser')).default,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
          },
          globals: {},
        },
      },
      ...(importScopeOverrides as object[]),
    ],
  });
  return eslint;
};

const lint = async (
  code: string,
  filePath: string,
): Promise<{ errors: Array<{ ruleId: string; message: string }> }> => {
  const eslint = await createLinter();
  const results = await eslint.lintText(code, { filePath });
  const messages = results.flatMap((r) => r.messages);
  return {
    errors: messages.map((m) => ({
      ruleId: m.ruleId ?? 'unknown',
      message: m.message ?? '',
    })),
  };
};

describe('import-scope', () => {
  describe('SCOPES', () => {
    test('matches feature directories under src (excluding app, core, types)', () => {
      expect(SCOPES).toEqual(expectedScopesFromFilesystem());
      expect(SCOPES).toEqual(
        expect.arrayContaining([
          'Hunts',
          'Schemas',
          'Sources',
          'Rules',
          'Settings',
        ]),
      );
    });
  });

  describe('feature scope restrictions', () => {
    test('Sources cannot import from Settings', async () => {
      const { errors } = await lint(
        `import { Foo } from '@/Settings/components/Foo';`,
        'src/Sources/components/Bar.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/Sources or @/core'),
        }),
      );
    });

    test('Sources cannot import from Rules', async () => {
      const { errors } = await lint(
        `import { Foo } from '@/Rules/hooks/useRule';`,
        'src/Sources/hooks/useSource.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/Sources or @/core'),
        }),
      );
    });

    test('Sources can import from @/core', async () => {
      const { errors } = await lint(
        `import { Form } from '@/core/components/Form';`,
        'src/Sources/components/Baz.tsx',
      );
      expect(errors.filter((e) => e.ruleId === RULE_ID)).toHaveLength(0);
    });

    test('Sources can import from own scope', async () => {
      const { errors } = await lint(
        `import { useSource } from '@/Sources/hooks/useSource';`,
        'src/Sources/components/Baz.tsx',
      );
      expect(errors.filter((e) => e.ruleId === RULE_ID)).toHaveLength(0);
    });

    test('Hunts cannot import from Rules', async () => {
      const { errors } = await lint(
        `import { ListRulesTree } from '@/Rules/components/ListRulesTree';`,
        'src/Hunts/scenes/HuntListScene/index.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/Hunts or @/core'),
        }),
      );
    });

    test('Settings cannot import from Sources', async () => {
      const { errors } = await lint(
        `import { Foo } from '@/Sources/components/Foo';`,
        'src/Settings/components/Bar.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/Settings or @/core'),
        }),
      );
    });
  });

  describe('core restrictions', () => {
    test('core cannot import from Sources', async () => {
      const { errors } = await lint(
        `import { Foo } from '@/Sources/components/Foo';`,
        'src/core/components/Bar.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/core'),
        }),
      );
    });

    test('core cannot import from Settings', async () => {
      const { errors } = await lint(
        `import { Foo } from '@/Settings/contexts/ListFieldMapsContext';`,
        'src/core/hooks/useFoo.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Use only @/core'),
        }),
      );
    });

    test('core can import from own scope', async () => {
      const { errors } = await lint(
        `import { Form } from '@/core/components/Form';`,
        'src/core/components/Baz.tsx',
      );
      expect(errors.filter((e) => e.ruleId === RULE_ID)).toHaveLength(0);
    });

    test('test wrapper can import across scopes', async () => {
      const { errors } = await lint(
        `import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';`,
        'src/core/utils/test-utils/buildTestWrapper.tsx',
      );
      expect(errors.filter((e) => e.ruleId === RULE_ID)).toHaveLength(0);
    });
  });

  describe('relative parent imports', () => {
    test('../ is not allowed in Sources', async () => {
      const { errors } = await lint(
        `import { Foo } from '../utils/foo';`,
        'src/Sources/components/Bar.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Relative parent imports'),
        }),
      );
    });

    test('../../ is not allowed', async () => {
      const { errors } = await lint(
        `import { Baz } from '../../hooks/useBaz';`,
        'src/Sources/components/forms/BazForm.tsx',
      );
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining('Relative parent imports'),
        }),
      );
    });

    test('./ is allowed', async () => {
      const { errors } = await lint(
        `import { local } from './local';`,
        'src/Sources/components/Baz.tsx',
      );
      expect(errors.filter((e) => e.ruleId === RULE_ID)).toHaveLength(0);
    });
  });
});
