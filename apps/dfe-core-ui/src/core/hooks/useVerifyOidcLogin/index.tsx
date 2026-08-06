import { useQuery } from '@tanstack/react-query';
import { verifyOidcLogin } from './api';

export const VERIFY_OIDC_LOGIN_QUERY_KEY = (name?: string | null) => [
  'verifyOidcLogin',
  ...(name ? [name] : []),
];
export const useVerifyOidcLogin = ({ name }: { name?: string | null }) => {
  const isQueryEnabled = !!name;
  const { data, isLoading, error } = useQuery({
    queryKey: VERIFY_OIDC_LOGIN_QUERY_KEY(name),
    queryFn: () =>
      verifyOidcLogin({
        pathParams: { name: name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
