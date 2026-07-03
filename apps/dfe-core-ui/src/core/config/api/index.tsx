import { createApiClient } from './client';
import { getApiAuthHeaders } from './getApiAuthHeaders';
import { handleApiUnauthorized } from './handleApiUnauthorized';

export const apiClient = createApiClient({
  // Prefer an explicit build-time base URL; otherwise fall back to the browser's
  // own origin (same-origin via dfe-proxy) client-side, or the internal engine URL
  // server-side. `new URL(path, baseUrl)` requires a non-empty absolute base, so an
  // empty string here would throw before any request is dispatched.
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : process.env.INTERNAL_API_URL) ||
    '',
  getAuthHeaders: getApiAuthHeaders,
  onUnauthorized: handleApiUnauthorized,
});
