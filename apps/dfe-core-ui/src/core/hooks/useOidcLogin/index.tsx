import { useQuery } from '@tanstack/react-query';
import { oidcLogin } from './api';

export const useOidcLogin = ({
  provider,
  returnTo,
}: {
  provider: string;
  /** Where the engine's callback sends the browser back to, with the token in the fragment. */
  returnTo: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['oidcLogin', provider, returnTo],
    queryFn: async () =>
      oidcLogin({
        pathParams: { provider },
        queryParams: { redirect: false, return_to: returnTo },
      }),
    enabled: !!provider,
    retry: false,
  });

  return { data, isLoading, error };
};
