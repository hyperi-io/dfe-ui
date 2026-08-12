import { useQuery } from '@tanstack/react-query';
import { oidcLogin } from './api';

export const useOidcLogin = ({ provider }: { provider: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['oidcLogin', provider],
    queryFn: async () =>
      oidcLogin({
        pathParams: { provider },
        queryParams: { redirect: false },
      }),
    enabled: !!provider,
    retry: false,
  });

  return { data, isLoading, error };
};
