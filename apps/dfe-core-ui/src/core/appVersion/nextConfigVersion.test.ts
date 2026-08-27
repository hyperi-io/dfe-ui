import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { appVersionEnv } from './resolveAppVersion';

// Next inlines NEXT_PUBLIC_APP_VERSION at build time, which vitest cannot
// exercise, so these guard the env block next.config feeds into that step.
describe('appVersionEnv', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  const scratch = () => {
    const dir = mkdtempSync(join(tmpdir(), 'dfe-app-version-env-'));
    dirs.push(dir);
    return dir;
  };

  it('carries the resolved version under the key the sidebar reads', () => {
    const root = scratch();
    writeFileSync(join(root, 'VERSION'), 'v1.4.0\n');

    expect(appVersionEnv({ root, env: { NODE_ENV: 'test' } })).toEqual({
      NEXT_PUBLIC_APP_VERSION: '1.4.0',
    });
  });

  it('defines the key as empty rather than dropping it when nothing is stamped', () => {
    const root = scratch();

    expect(appVersionEnv({ root, env: { NODE_ENV: 'test' } })).toEqual({
      NEXT_PUBLIC_APP_VERSION: '',
    });
  });
});
