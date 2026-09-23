/**
 * @vitest-environment node
 */
import { describe, expect, test } from 'vitest';
import { ESLint } from 'eslint';
import { antdImportRejectOverrides, RULE_ID } from './antd-import-reject.mjs';

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
      ...(antdImportRejectOverrides as object[]),
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

const ruleErrors = (errors: Array<{ ruleId: string; message: string }>) =>
  errors.filter((error) => error.ruleId === RULE_ID);

describe('antd-import-reject', () => {
  test.each(['Drawer', 'Form', 'Table', 'Modal', 'Tooltip'] as const)(
    'rejects importing %s from antd',
    async (name) => {
      const { errors } = await lint(
        `import { ${name} } from 'antd';`,
        'src/Sources/components/Bar.tsx',
      );

      expect(ruleErrors(errors)).toContainEqual(
        expect.objectContaining({
          ruleId: RULE_ID,
          message: expect.stringContaining(`@/core/components/${name}`),
        }),
      );
    },
  );

  test('rejects aliased wrapped imports from antd', async () => {
    const { errors } = await lint(
      `import { Drawer as AntdDrawer } from 'antd';`,
      'src/Settings/components/Bar.tsx',
    );

    expect(ruleErrors(errors)).toContainEqual(
      expect.objectContaining({
        ruleId: RULE_ID,
        message: expect.stringContaining('@/core/components/Drawer'),
      }),
    );
  });

  test('rejects wrapped names in mixed antd imports', async () => {
    const { errors } = await lint(
      `import { Button, Form, Spin } from 'antd';`,
      'src/Rules/components/Baz.tsx',
    );

    expect(ruleErrors(errors)).toHaveLength(1);
    expect(ruleErrors(errors)[0]?.message).toContain('@/core/components/Form');
  });

  test('allows other antd components', async () => {
    const { errors } = await lint(
      `import { Button, Spin } from 'antd';`,
      'src/Sources/components/Bar.tsx',
    );

    expect(ruleErrors(errors)).toHaveLength(0);
  });

  test('allows antd type imports that are not the wrapped components', async () => {
    const { errors } = await lint(
      `import type { FormProps, TableProps, FormInstance } from 'antd';`,
      'src/Sources/components/Bar.tsx',
    );

    expect(ruleErrors(errors)).toHaveLength(0);
  });

  test.each(['Drawer', 'Form', 'Table', 'Modal', 'Tooltip'] as const)(
    'allows %s to be imported from antd inside its wrapper',
    async (name) => {
      const { errors } = await lint(
        `import { ${name} as Antd${name} } from 'antd';`,
        `src/core/components/${name}/index.tsx`,
      );

      expect(ruleErrors(errors)).toHaveLength(0);
    },
  );

  test('rejects importing a different wrapped component from a wrapper', async () => {
    const { errors } = await lint(
      `import { Table } from 'antd';`,
      'src/core/components/Form/index.tsx',
    );

    expect(ruleErrors(errors)).toContainEqual(
      expect.objectContaining({
        ruleId: RULE_ID,
        message: expect.stringContaining('@/core/components/Table'),
      }),
    );
  });
});
