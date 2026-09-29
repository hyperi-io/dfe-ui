/** @vitest-environment node */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { NextConfig } from 'next';
import { describe, expect, test } from 'vitest';

const APP_ROOT = join(import.meta.dirname, '..', '..', '..');

const loadNextConfig = async (): Promise<NextConfig> =>
  (
    (await import(pathToFileURL(join(APP_ROOT, 'next.config.ts')).href)) as {
      default: NextConfig;
    }
  ).default;

describe('next.config security headers', () => {
  test('the response does not announce the framework', async () => {
    const config = await loadNextConfig();

    expect(config.poweredByHeader).toBe(false);
  });

  test('every path gets nosniff, the referrer policy and the legacy frame guard', async () => {
    const config = await loadNextConfig();
    const rules = (await config.headers?.()) ?? [];
    const everyPath = rules.find((rule) => rule.source === '/:path*');

    expect(everyPath?.headers).toEqual(
      expect.arrayContaining([
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ]),
    );
  });
});
