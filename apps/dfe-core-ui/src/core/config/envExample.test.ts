/** @vitest-environment node */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

/*
 * .env.example is the contract a developer follows to get a working app, and a
 * name that no code reads is worse than a missing one: it reads as a dial.
 * NEXT_PUBLIC_HYPERDX_URL sat here after the embed moved to the runtime
 * HYPERDX_URL, and a build with it set produced zero occurrences anywhere in
 * .next -- nothing read it.
 *
 * Guards one direction only: every name .env.example advertises must be read
 * somewhere in src/ or e2e/. The reverse would fail on every optional deployment
 * var the file deliberately omits (DFE_AUTH_MODE, GIT_COMMIT, NODE_ENV).
 */

const APP_ROOT = join(import.meta.dirname, '..', '..', '..');

/** Names consumed by a dependency rather than by our own source. */
const LIBRARY_CONSUMED = new Set([
  // next-auth reads this itself to build callback URLs.
  'NEXTAUTH_URL',
]);

function declaredNames(): string[] {
  const contents = readFileSync(join(APP_ROOT, '.env.example'), 'utf8');
  return contents
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name));
}

// The acceptance suite reads names of its own, so .env.example advertises them too.
const SCANNED_DIRS = ['src', 'e2e'];

function sourceText(): string {
  return SCANNED_DIRS.flatMap((dir) =>
    readdirSync(join(APP_ROOT, dir), {
      recursive: true,
      withFileTypes: true,
    })
      .filter(
        (entry) =>
          entry.isFile() &&
          /\.tsx?$/.test(entry.name) &&
          !/\.test\.tsx?$/.test(entry.name),
      )
      .map((entry) => readFileSync(join(entry.parentPath, entry.name), 'utf8')),
  ).join('\n');
}

describe('.env.example', () => {
  const names = declaredNames();
  const source = sourceText();

  test('declares at least one variable (the parser found the file)', () => {
    expect(names.length).toBeGreaterThan(0);
  });

  test('reads the app source (the scan found files)', () => {
    expect(source).toContain('process.env.NEXT_PUBLIC_API_URL');
  });

  test.each(names)('%s is read by the app', (name) => {
    if (LIBRARY_CONSUMED.has(name)) {
      return;
    }
    expect(source).toContain(`process.env.${name}`);
  });
});
