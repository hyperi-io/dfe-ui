import path from 'node:path';
import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';

/**
 * The native-dev smoke: one engine and one `next dev` console, one worker,
 * headless. scripts/macos-dev-smoke.sh sets SMOKE_ENGINE_DIR and the rest, and
 * Playwright starts both servers, waits for them and stops them again. With
 * SMOKE_ENGINE_DIR unset it runs against servers that are already up.
 * Its own folder and config keep it out of the e2e suite's `testDir`.
 */
const uiPort = process.env.SMOKE_UI_PORT ?? '3000';
const uiUrl = process.env.SMOKE_UI_URL ?? `http://localhost:${uiPort}`;
const engineUrl = process.env.SMOKE_ENGINE_URL ?? 'http://127.0.0.1:8003';
const engineDir = process.env.SMOKE_ENGINE_DIR;
const uiRoot = path.resolve(__dirname, '..', '..', '..');

type Server = Extract<
  NonNullable<PlaywrightTestConfig['webServer']>,
  { command: string }
>;

const shutdown = { signal: 'SIGTERM', timeout: 10_000 } as const;

// Both go on the command line, which older dfe-engine Makefiles honour for the
// workspace and ignore for the env file (the script puts that file in place).
const makeArgs = [
  ['E2E_ENV_FILE', process.env.SMOKE_ENGINE_ENV_FILE],
  ['E2E_WORKSPACE', process.env.SMOKE_ENGINE_WORKSPACE],
]
  .filter(([, value]) => value)
  .map(([name, value]) => `${name}='${value}'`)
  .join(' ');

const servers: Server[] | undefined = engineDir
  ? [
      {
        name: 'engine',
        command: `make e2e-server ${makeArgs}`,
        cwd: engineDir,
        env: { UV_FROZEN: '1' },
        // /readyz answers once ClickHouse and the schema are up, which only a run with ClickHouse waits for.
        url: `${engineUrl}/${process.env.SMOKE_ENGINE_WAIT_READY ? 'readyz' : 'api/e2e/status'}`,
        timeout: 240_000,
        reuseExistingServer: false,
        gracefulShutdown: shutdown,
        stdout: 'pipe',
        stderr: 'pipe',
      },
      {
        name: 'console',
        command: `corepack yarn workspace dfe-core-ui dev --port ${uiPort}`,
        cwd: uiRoot,
        env: {
          NEXT_PUBLIC_API_URL: engineUrl,
          INTERNAL_API_URL: engineUrl,
          NEXTAUTH_URL: uiUrl,
          NEXTAUTH_SECRET: process.env.SMOKE_RUN_SECRET ?? 'smoke-dev-value',
          NEXT_TELEMETRY_DISABLED: '1',
        },
        url: `${uiUrl}/login`,
        timeout: 300_000,
        reuseExistingServer: false,
        gracefulShutdown: shutdown,
        stdout: 'pipe',
        stderr: 'pipe',
      },
    ]
  : undefined;

export default defineConfig({
  testDir: __dirname,
  outputDir: path.join(
    process.env.SMOKE_OUT_DIR ?? path.join(__dirname, 'results'),
    'playwright',
  ),
  timeout: 180_000,
  expect: { timeout: 30_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  webServer: servers,
  use: {
    trace: 'retain-on-failure',
    // The first visit to each route compiles it under `next dev`.
    navigationTimeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
