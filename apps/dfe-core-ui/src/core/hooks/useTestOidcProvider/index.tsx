import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { testOidcProvider } from './api';

export const useTestOidcProvider = ({ name }: { name?: string | null }) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.oidcProviders.test({ name }),
    queryFn: () =>
      testOidcProvider({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error, refetch, isRefetching };
};
