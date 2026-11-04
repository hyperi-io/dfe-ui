import type { paths } from '@repo/dfe-engine-types';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';
import { ApiError, createApiClient } from './client';
import { getApiAuthHeaders } from './getApiAuthHeaders';
import { handleApiUnauthorized } from './handleApiUnauthorized';
import { handlePasswordChangeRequired } from './handlePasswordChangeRequired';

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : process.env.INTERNAL_API_URL) ||
  '';

export const apiClient = createApiClient({
  baseUrl,
  getAuthHeaders: getApiAuthHeaders,
  onUnauthorized: handleApiUnauthorized,
  onPasswordChangeRequired: handlePasswordChangeRequired,
});

/** Typed react-query hooks over the engine's openapi.json, sent through apiClient. */
export const $api = createClient(
  createFetchClient<paths>({
    baseUrl,
    fetch: (request) => apiClient.fetch(request),
  }),
);

/** The client throws ApiError for every refusal, though openapi-react-query types the error as the problem body. */
export const asApiError = (error: unknown) => (error as ApiError | null) ?? null;
