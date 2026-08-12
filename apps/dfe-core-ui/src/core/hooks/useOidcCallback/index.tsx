import { useQuery } from '@tanstack/react-query';
import { oidcCallback } from './api';

export const useOidcCallback = ({ provider }: { provider: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['oidcCallback', provider],
    queryFn: async () =>
      oidcCallback({
        pathParams: { provider },
      }),
    enabled: !!provider,
    retry: false,
  });

  return { data, isLoading, error };
};
