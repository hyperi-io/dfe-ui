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
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(),
}));

afterEach(() => {
  cleanup();
});
