import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryKindsApi } from './api';

/**
 * What KIND of thing an artefact may be.
 *
 * Declared in the app manifest, so a new authored language appears here
 * without a UI change - never hardcode this list.
 */
export const useFetchLibraryKinds = ({
  queryEnabled = true,
}: { queryEnabled?: boolean } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.library.kinds(),
    queryFn: () => fetchLibraryKindsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
