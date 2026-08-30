import { useQuery } from '@tanstack/react-query';
import { fetchBackingServicesApi } from './api';

export const BACKING_SERVICES_QUERY_KEY = ['backing-services'];

/**
 * The data layer's DECLARED deploy configuration, one entry per service.
 *
 * Declared, not observed: the engine reads the deploy repo and runs no
 * Kubernetes client, so these are the values Argo has been asked for rather
 * than what the cluster is running. The list is the engine's catalogue, so a
 * third backing service appears here without a UI change.
 */
export const useFetchBackingServices = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: BACKING_SERVICES_QUERY_KEY,
    queryFn: () => fetchBackingServicesApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
