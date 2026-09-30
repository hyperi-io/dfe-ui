// jsdom 28+ provides its own fetch that MSW cannot intercept.
// Restore Node's native fetch (undici) so MSW's setupServer interceptors work.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { fetch, Headers, Request, Response } from 'undici';
import { afterEach, beforeEach, vi } from 'vitest';
import './src/core/config/zodJitless';

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
  usePathname: vi.fn(),
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
      import('./src/core/stores/systemDefaultsStore'),
    ]);
    useAuthStore.getState().reset();
    useSystemDefaultsStore.getState().reset();
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
