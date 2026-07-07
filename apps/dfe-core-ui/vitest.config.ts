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
      ],
    },
  },
});
