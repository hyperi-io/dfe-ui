import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchCompat } from './api';

/** The profiles every source binds unless it names its own list, and the revision they were read at. */
export const useFetchCompat = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ingest.compat(),
    queryFn: fetchCompat,
    enabled: queryEnabled,
    retry: false,
  });

  return { data, isLoading, isFetching, error, refetch };
};
