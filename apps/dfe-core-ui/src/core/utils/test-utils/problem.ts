import type { ApiErrorResponseBody } from '@/core/config/api/client';

/** A problem+json body as the engine answers a refusal, with its extension members. */
export const problem = (
  status: number,
  code: string,
  detail: string,
  extra: Record<string, unknown> = {},
): ApiErrorResponseBody => ({
  type: 'about:blank',
  title: `Error ${status}`,
  status,
  detail,
  code,
  ...extra,
});
