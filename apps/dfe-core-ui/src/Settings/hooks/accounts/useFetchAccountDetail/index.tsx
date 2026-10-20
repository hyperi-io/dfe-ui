import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAccountDetail } from './api';

export const useFetchAccountDetail = ({
  username,
}: {
  username?: string | null;
}) => {
  const isQueryEnabled = !!username;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.accounts.account({ username }),
    queryFn: () =>
      fetchAccountDetail({
        pathParams: { username: username ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
