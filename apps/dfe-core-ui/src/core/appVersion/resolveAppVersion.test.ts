import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveAppVersion } from './resolveAppVersion';

const baseEnv = {
  NODE_ENV: 'test',
} as const;

const emptyEnv = {
  ...baseEnv,
  NEXT_PUBLIC_APP_VERSION: undefined,
  HYPERCI_VERSION: undefined,
} as const;

describe('resolveAppVersion', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  const scratch = () => {
    const dir = mkdtempSync(join(tmpdir(), 'dfe-app-version-'));
    dirs.push(dir);
    return dir;
  };

  it('uses the stamped VERSION file when it is present', () => {
    const root = scratch();
    writeFileSync(join(root, 'VERSION'), '1.3.8\n');

    expect(
      resolveAppVersion({
        root,
        env: { ...baseEnv, NEXT_PUBLIC_APP_VERSION: '9.9.9' },
      }),
    ).toBe('1.3.8');
  });

  it('strips a leading v from the stamp', () => {
    const root = scratch();
    writeFileSync(join(root, 'VERSION'), 'v1.3.8\n');

    expect(resolveAppVersion({ root, env: emptyEnv })).toBe('1.3.8');
  });

  it('loses to the stamped VERSION file but beats NEXT_PUBLIC_APP_VERSION', () => {
    const root = scratch();
    const env = {
      ...baseEnv,
      HYPERCI_VERSION: '2.0.0',
      NEXT_PUBLIC_APP_VERSION: '9.9.9',
    };

    expect(resolveAppVersion({ root, env })).toBe('2.0.0');

    writeFileSync(join(root, 'VERSION'), '1.3.8\n');
    expect(resolveAppVersion({ root, env })).toBe('1.3.8');
  });

  it('falls back to NEXT_PUBLIC_APP_VERSION when VERSION is absent', () => {
    const root = scratch();

    expect(
      resolveAppVersion({
        root,
        env: { ...baseEnv, NEXT_PUBLIC_APP_VERSION: '1.2.0' },
      }),
    ).toBe('1.2.0');
  });

  it('returns undefined when nothing is stamped or set', () => {
    const root = scratch();

    expect(resolveAppVersion({ root, env: emptyEnv })).toBeUndefined();
  });
});
