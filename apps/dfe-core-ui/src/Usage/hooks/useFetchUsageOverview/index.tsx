import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchUsageOverview } from './api';

/** The rollup is daily, so a minute between reads loses nothing. */
const STALE_MS = 60_000;

/** Every usage metric over the last 30 UTC days, each with its highest in the last 7. */
export const useFetchUsageOverview = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.usage.overview(),
    queryFn: fetchUsageOverview,
    enabled: queryEnabled,
    staleTime: STALE_MS,
    retry: false,
  });

  return { data, isLoading, error };
};
