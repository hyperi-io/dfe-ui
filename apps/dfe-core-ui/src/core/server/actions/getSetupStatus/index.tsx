import { API_CONFIG } from '@/core/config/api/endpoints';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';

/** No engine URL configured: a broken deployment, never a transient failure. */
export class MissingApiUrlError extends Error {
  constructor() {
    super('Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set');
    this.name = 'MissingApiUrlError';
  }
}

/**
 * The engine did not answer: the connection failed, or the gateway in front of
 * it returned 502, 503 or 504. The message carries no address, because it can
 * reach the screen.
 */
export class EngineUnreachableError extends Error {
  constructor(options?: ErrorOptions) {
    super('The DFE engine did not answer', options);
    this.name = 'EngineUnreachableError';
  }
}

const GATEWAY_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);

export const getSetupStatus = async (): Promise<TFetchSetupStatusResponse> => {
  // Server-side fetch: INTERNAL_API_URL is read at request time, while
  // NEXT_PUBLIC_API_URL is inlined at build (the container bakes "").
  const baseUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new MissingApiUrlError();
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${API_CONFIG.auth.setupStatus}`, {
      cache: 'no-store',
    });
  } catch (cause) {
    throw new EngineUnreachableError({ cause });
  }

  if (GATEWAY_UNAVAILABLE_STATUSES.has(response.status)) {
    throw new EngineUnreachableError();
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch setup status (${response.status} ${response.statusText})`,
    );
  }

  return response.json() as Promise<TFetchSetupStatusResponse>;
};
