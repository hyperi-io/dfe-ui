import { ApiError } from '@/core/config/api/client';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { fetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail/api';
import { useQuery } from '@tanstack/react-query';

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
    queryKey: QUERY_KEYS.accounts.account({ username }),
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
