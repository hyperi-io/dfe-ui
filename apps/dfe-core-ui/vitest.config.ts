import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vitest/config';

const appRoot = __dirname;

// vi.mock replaces the worker's module cache. Later files in that worker then
// see the first mock, and which file runs first changes with the worker count.
// Those files keep a fresh module graph. Everything else shares one graph per
// worker so CI does not re-import antd/react for every file.
const escapeGlob = (value: string) =>
  value.replace(/[[\]{}()*+?!,\\]/g, '\\$&');

const listTests = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTests(full));
    } else if (/\.test\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const mocked: string[] = [];
const shared: string[] = [];
for (const file of [
  ...listTests(path.join(appRoot, 'src')),
  ...listTests(path.join(appRoot, 'eslint')),
]) {
  const source = fs.readFileSync(file, 'utf8');
  const pattern = escapeGlob(
    path.relative(appRoot, file).split(path.sep).join('/'),
  );
  if (/\bvi\.(?:mock|doMock)\s*\(/.test(source)) {
    mocked.push(pattern);
  } else {
    shared.push(pattern);
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(appRoot, 'src'),
    },
  },
  test: {
    server: {
      deps: {
        external: ['antd', 'rc-trigger', 'rc-util'],
      },
    },
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
    globals: true,
    // The suites use 15s findBy backstops (timing-flake doctrine); the vitest
    // default of 5s kills the test before a backstop can fire.
    testTimeout: 20_000,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/__tests__/**',
        '**/*.d.ts',
        '**/types.ts',
        '**/*.config.{ts,tsx}',
        '**/*.mocks.{ts,tsx}',
        'e2e/**',
      ],
    },
    // sequence.concurrent stays off: tests in one file share a single MSW server.
    projects: [
      {
        extends: true,
        test: {
          name: 'shared',
          isolate: false,
          include: shared,
        },
      },
      {
        extends: true,
        test: {
          name: 'isolated',
          isolate: true,
          include: mocked,
        },
      },
    ],
  },
});
