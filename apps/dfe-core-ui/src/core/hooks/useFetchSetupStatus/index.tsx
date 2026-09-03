import { useQuery } from '@tanstack/react-query';
import { fetchSetupStatus } from './api';

export const QUERY_KEY_SETUP_STATUS = () => ['setup-status'];

export const useFetchSetupStatus = ({
  queryEnabled = true,
  refetchInterval,
}: {
  queryEnabled?: boolean;
  refetchInterval?:
    | number
    | false
    | ((query?: unknown) => number | false)
    | undefined;
} = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY_SETUP_STATUS(),
    queryFn: () => fetchSetupStatus(),
    enabled: queryEnabled,
    refetchInterval,
  });
  return { data, isLoading, error, refetch };
};
