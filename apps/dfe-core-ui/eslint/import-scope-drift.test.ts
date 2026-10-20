/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';
import { APP_ROOT, moves } from '../../../scripts/import-scope-drift.mjs';
import {
  importScopeDriftOverrides,
  RULE_ID,
} from './import-scope-drift.mjs';

const createLinter = async () =>
  new ESLint({
    cwd: APP_ROOT,
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
        },
      },
      ...(importScopeDriftOverrides as object[]),
    ],
  });

const lintFile = async (filePath: string) => {
  const eslint = await createLinter();
  const results = await eslint.lintText(
    readFileSync(path.join(APP_ROOT, filePath), 'utf8'),
    { filePath },
  );
  return results.flatMap((result) => result.messages);
};

describe('import-scope-drift eslint', () => {
  test('is configured as a warning', () => {
    expect(importScopeDriftOverrides[0]?.rules?.[RULE_ID]).toBe('warn');
  });

  test('does not warn on a file whose exports are disabled', async () => {
    const messages = await lintFile('src/core/helpers/date.helpers.ts');

    expect(messages.filter((message) => message.ruleId === RULE_ID)).toEqual(
      [],
    );
  });

  test('warns, and does not error, on a single-scope core export', async () => {
    const move = moves[0];
    if (!move) return;

    const messages = await lintFile(move.file);
    const drift = messages.filter((message) => message.ruleId === RULE_ID);

    expect(drift.some((message) => message.severity === 2)).toBe(false);
    expect(drift).toContainEqual(
      expect.objectContaining({
        severity: 1,
        message: `'${move.name}' is only used by ${move.scope}. Move it into that scope.`,
      }),
    );
  });
});
