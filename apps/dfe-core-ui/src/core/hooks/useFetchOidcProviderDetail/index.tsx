import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchOidcProviderDetailApi } from './api';

export const QUERY_KEY_OIDC_PROVIDER_DETAIL = ({
  name,
}: {
  name?: string | null;
}) => ['oidc-provider-detail', ...(name ? [name] : [])];
export const useFetchOidcProviderDetail = ({
  name,
  onError,
  retry = true,
}: {
  name?: string | null;
  onError?: (error: Error & { status?: number }) => void;
  retry?: boolean;
}) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY_OIDC_PROVIDER_DETAIL({ name }),
    queryFn: () =>
      fetchOidcProviderDetailApi({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
    retry,
  });

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return { data, isLoading, error };
};
