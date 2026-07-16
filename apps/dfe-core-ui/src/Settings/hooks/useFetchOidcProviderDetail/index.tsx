import { useQuery } from '@tanstack/react-query';
import { fetchOidcProviderDetailApi } from './api';

export const QUERY_KEY_OIDC_PROVIDER_DETAIL = ({
  name,
}: {
  name?: string | null;
}) => ['oidc-provider-detail', ...(name ? [name] : [])];
export const useFetchOidcProviderDetail = ({
  name,
}: {
  name?: string | null;
}) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY_OIDC_PROVIDER_DETAIL({ name }),
    queryFn: () =>
      fetchOidcProviderDetailApi({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
