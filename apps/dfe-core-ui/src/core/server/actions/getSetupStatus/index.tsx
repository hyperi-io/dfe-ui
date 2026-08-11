import { API_CONFIG } from '@/core/config/api/endpoints';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';

export const getSetupStatus = async (): Promise<TFetchSetupStatusResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
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
