import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppsApi } from './api';

/**
 * The app catalogue and its deployed instances.
 *
 * This is the manifest the whole surface renders from - multiplicity decides
 * where an app appears, `file_sets` decides whether it gets an editor at all.
 * Nothing here may be hardcoded against an app name.
 */
export const useFetchApps = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.apps.instances(),
    queryFn: () => fetchAppsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
