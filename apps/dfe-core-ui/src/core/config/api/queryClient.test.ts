import { describe, expect, it } from 'vitest';
import { ApiError, ApiTimeoutError } from './client';
import { createQueryClient, shouldRetryQuery } from './queryClient';

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
    ['a read past its deadline', new ApiTimeoutError(30_000), 0, true],
    [
      'a read past its deadline a second time',
      new ApiTimeoutError(30_000),
      1,
      false,
    ],
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
});
