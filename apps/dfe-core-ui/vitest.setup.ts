// jsdom 28+ provides its own fetch that MSW cannot intercept.
// Restore Node's native fetch (undici) so MSW's setupServer interceptors work.
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { createRequire } from 'node:module';
import React from 'react';
import { fetch, Headers, Request, Response } from 'undici';
import { afterEach, beforeEach, vi } from 'vitest';
import './src/core/config/zodJitless';
import { useSystemDeploymentStore } from './src/core/stores/system/systemDeploymentStore';

// jsdom does not provide ResizeObserver - required by Ant Design
class ResizeObserverMock {
  observe = () => undefined;
  unobserve = () => undefined;
  disconnect = () => undefined;
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

// jsdom does not provide matchMedia - Ant Design's responsive observer calls it
// from a layout effect, so without it any component using the grid throws.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const requireFromHere = createRequire(import.meta.url);

// antd writes every component's CSS into <style> tags. jsdom answers each
// getComputedStyle call by matching all of those rules (24-85ms a call), and
// user-event and Testing Library's role queries make thousands of calls, so a
// drawer flow took 36s. Nothing here asserts on layout, so the tags are still
// created and keyed as before but carry no rules.
const cssinjsRequire = createRequire(
  requireFromHere.resolve('@ant-design/cssinjs'),
);
const dynamicCSS = cssinjsRequire('@rc-component/util/lib/Dom/dynamicCSS') as {
  updateCSS: (css: string, key: string, option?: object) => HTMLStyleElement;
};
// Setup runs once per test file in a shared worker, so wrap only once.
const RULE_FREE = Symbol.for('dfe-ui.cssinjs.ruleFree');
const patchedCSS = dynamicCSS as typeof dynamicCSS & { [RULE_FREE]?: true };
if (!patchedCSS[RULE_FREE]) {
  const updateCSSWithRules = dynamicCSS.updateCSS;
  dynamicCSS.updateCSS = (_css, key, option) =>
    updateCSSWithRules('', key, option);
  patchedCSS[RULE_FREE] = true;
}

// findBy* and waitFor return the moment their condition holds, so this is only
// the point a missing condition is declared failed. The 1s default is shorter
// than the first render of an antd page on a loaded runner.
configure({ asyncUtilTimeout: 15_000 });

globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
globalThis.Request = Request as unknown as typeof globalThis.Request;
globalThis.Response = Response as unknown as typeof globalThis.Response;

// Mock next calls globally - to reduce setup time
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement('a', { href, ...props }, children),
}));
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));
vi.mock('next-auth/react', () => ({
  getSession: vi.fn().mockResolvedValue(null),
  getCsrfToken: vi.fn().mockResolvedValue('csrf'),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Workers reuse a process. Module isolation does not reset process.env or
// the singletons below, and file order changes as soon as more than one
// worker is running.
let envSnapshot: NodeJS.ProcessEnv = { ...process.env };

beforeEach(() => {
  envSnapshot = { ...process.env };
});

afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();

  // Loaded after the test file so its vi.mock calls win. A partial next-auth
  // mock can make this import throw; that file keeps its own module graph.
  try {
    const [
      { resetCachedSession },
      { useAuthStore },
      { useSystemDefaultsStore },
    ] = await Promise.all([
      import('./src/core/auth/cachedSession'),
      import('./src/core/stores/authStore'),
      import('./src/core/stores/system/systemDefaultsStore'),
      import('./src/core/stores/system/systemDeploymentStore'),
    ]);
    useAuthStore.getState().reset();
    useSystemDefaultsStore.getState().reset();
    useSystemDeploymentStore.getState().reset();
    resetCachedSession();
  } catch {
    // The file replaced a dependency this graph imports. Nothing shared to reset.
  }

  for (const key of Object.keys(process.env)) {
    if (!(key in envSnapshot)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(envSnapshot)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});
