import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchAccountDetail = ({
  username,
}: {
  username?: string | null;
}) => {
  const isQueryEnabled = !!username;
  const { data, isLoading, error } = useQuery({
    queryKey: ['account', username],
    queryFn: () =>
      apiClient.get(API_CONFIG.accounts.account, {
        pathParams: { username: username ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
