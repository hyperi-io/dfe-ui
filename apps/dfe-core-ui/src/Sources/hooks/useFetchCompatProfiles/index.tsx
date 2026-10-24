import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchCompatProfiles } from './api';

/** The compatibility profiles the deployment stores, each at its current version. */
export const useFetchCompatProfiles = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ingest.compatProfiles(),
    queryFn: fetchCompatProfiles,
    enabled: queryEnabled,
    retry: false,
  });

  return { profiles: data?.items, isLoading, error };
};
