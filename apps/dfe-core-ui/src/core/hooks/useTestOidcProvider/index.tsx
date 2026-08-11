import { useQuery } from '@tanstack/react-query';
import { testOidcProvider } from './api';

export const TEST_OIDC_PROVIDER_QUERY_KEY = (name?: string | null) => [
  'testOidcProvider',
  ...(name ? [name] : []),
];
export const useTestOidcProvider = ({ name }: { name?: string | null }) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: TEST_OIDC_PROVIDER_QUERY_KEY(name),
    queryFn: () =>
      testOidcProvider({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error, refetch, isRefetching };
};
