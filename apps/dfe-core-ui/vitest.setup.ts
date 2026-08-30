// jsdom 28+ provides its own fetch that MSW cannot intercept.
// Restore Node's native fetch (undici) so MSW's setupServer interceptors work.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { fetch, Headers, Request, Response } from 'undici';
import { afterEach, vi } from 'vitest';

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
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(),
}));

afterEach(() => {
  cleanup();
});
