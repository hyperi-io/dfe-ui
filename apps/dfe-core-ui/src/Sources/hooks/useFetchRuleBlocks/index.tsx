import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchRuleBlocks } from './api';

/** The receiver's rule blocks in the order they run, and the revision they were read at. */
export const useFetchRuleBlocks = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ingest.rules(),
    queryFn: fetchRuleBlocks,
    enabled: queryEnabled,
    retry: false,
  });

  return { data, isLoading, isFetching, error, refetch };
};
