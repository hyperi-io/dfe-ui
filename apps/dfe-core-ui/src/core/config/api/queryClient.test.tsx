import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { apiClient } from '.';
import { ApiError, ApiTimeoutError } from './client';
import { createQueryClient, shouldRetryQuery } from './queryClient';

vi.mock('@/core/config/engineTimeout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/config/engineTimeout')>()),
  ENGINE_READ_DEADLINE_MS: 300,
}));

let flowAsks = 0;
const server = setupServer(
  // An engine that takes the request and never answers.
  http.get('/api/v1/sources/:name/flow', () => {
    flowAsks += 1;
    return new Promise<never>(() => undefined);
  }),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const apiError = (status: number) => new ApiError(status, '', { message: '' });

describe('shouldRetryQuery', () => {
  it.each([
    ['a 401, after the client refreshed the token', apiError(401), 0, true],
    ['a 401 a second time', apiError(401), 1, false],
    ['a 400', apiError(400), 0, false],
    ['a 403', apiError(403), 0, false],
    ['a 404', apiError(404), 0, false],
    ['a 409', apiError(409), 0, false],
    ['a 422 refusal', apiError(422), 0, false],
    ['a 500', apiError(500), 0, true],
    ['a 503', apiError(503), 0, true],
    ['a 500 a second time', apiError(500), 1, false],
    ['a dropped connection', new TypeError('Failed to fetch'), 0, true],
    [
      'a dropped connection a second time',
      new TypeError('Failed to fetch'),
      1,
      false,
    ],
    ['a 500 after many failures', apiError(500), 7, false],
    // A timed-out read may be a table scan still running, so it is not sent again.
    ['a read past its deadline', new ApiTimeoutError(30_000), 0, false],
  ])('%s', (_case, error, failures, expected) => {
    expect(shouldRetryQuery(failures, error)).toBe(expected);
  });

  it('is what the console query client retries with', () => {
    expect(createQueryClient().getDefaultOptions().queries?.retry).toBe(
      shouldRetryQuery,
    );
  });

  it('never retries a write, which may already have landed', () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry ?? 0).toBe(
      0,
    );
  });

  it('asks a silent engine once, then shows the timeout', async () => {
    const client = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['flow', 'silent'],
          queryFn: () =>
            apiClient.get('/api/v1/sources/{name}/flow', {
              pathParams: { name: 'source' },
            }),
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });
    expect(result.current.error).toBeInstanceOf(ApiTimeoutError);
    expect(flowAsks).toBe(1);
  });
});
