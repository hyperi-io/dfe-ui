import { ApiError } from '@/core/config/api/client';
import { fetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail/api';
import { useQuery } from '@tanstack/react-query';

export const SECURITY_ACCOUNT_QUERY_KEY = (username?: string | null) => [
  'security-account',
  ...(username ? [username] : []),
];

/**
 * One of the deployment's recovery accounts, or null when it has none by that name.
 *
 * A deployment without gitops has no break-glass account, so the engine's 404 is
 * an answer to show, not a failure to retry.
 */
export const useFetchSecurityAccount = ({
  username,
}: {
  username?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: SECURITY_ACCOUNT_QUERY_KEY(username),
    queryFn: async () => {
      try {
        return await fetchAccountDetail({
          pathParams: { username: username ?? '' },
        });
      } catch (failure) {
        if (failure instanceof ApiError && failure.status === 404) {
          return null;
        }
        throw failure;
      }
    },
    enabled: !!username,
  });

  return { data, isLoading, error };
};
