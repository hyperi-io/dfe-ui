import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

/** At most this many retries, so an engine fault reaches the screen within about a second. */
const MAX_QUERY_RETRIES = 1;

/**
 * Whether a failed read is worth asking again.
 *
 * A dropped connection or a 5xx may clear, and a 401 has already refreshed the
 * token by the time it lands here. Every other 4xx is the engine's answer.
 */
export const shouldRetryQuery = (
  failureCount: number,
  error: unknown,
): boolean => {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (!(error instanceof ApiError)) return true;
  return error.status === 401 || error.status >= 500;
};

/** The console's one query client, so every read shares the retry policy. */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: shouldRetryQuery } },
  });
