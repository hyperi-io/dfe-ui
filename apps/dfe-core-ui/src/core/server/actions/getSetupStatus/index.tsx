import { API_CONFIG } from '@/core/config/api/endpoints';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';

/** No engine URL configured: a broken deployment, never a transient failure. */
export class MissingApiUrlError extends Error {
  constructor() {
    super('Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set');
    this.name = 'MissingApiUrlError';
  }
}

export const getSetupStatus = async (): Promise<TFetchSetupStatusResponse> => {
  // Server-side fetch: INTERNAL_API_URL is read at request time, while
  // NEXT_PUBLIC_API_URL is inlined at build (the container bakes "").
  const baseUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new MissingApiUrlError();
  }

  const response = await fetch(`${baseUrl}${API_CONFIG.auth.setupStatus}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch setup status (${response.status} ${response.statusText})`,
    );
  }

  return response.json() as Promise<TFetchSetupStatusResponse>;
};
