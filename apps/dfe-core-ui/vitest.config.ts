import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
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
    include: ['src/**/*.test.{ts,tsx}', 'eslint/**/*.test.{ts,tsx}'],
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
  },
});
