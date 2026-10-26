import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSetupStatus } from './api';

export const useFetchSetupStatus = ({
  queryEnabled = true,
  refetchInterval,
}: {
  queryEnabled?: boolean;
  refetchInterval?:
    number | false | ((query?: unknown) => number | false) | undefined;
} = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.auth.setupStatus(),
    queryFn: () => fetchSetupStatus(),
    enabled: queryEnabled,
    refetchInterval,
  });
  return { data, isLoading, error, refetch };
};
