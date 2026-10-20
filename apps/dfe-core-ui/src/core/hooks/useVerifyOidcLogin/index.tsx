import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { verifyOidcLogin } from './api';

export const useVerifyOidcLogin = ({ name }: { name?: string | null }) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.oidcProviders.verifyLogin({ name }),
    queryFn: () =>
      verifyOidcLogin({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error, refetch, isRefetching };
};
