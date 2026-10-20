import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryVersionsApi } from './api';

/** An artefact's immutable version history. */
export const useFetchLibraryVersions = ({
  artifact,
  queryEnabled = true,
}: {
  artifact: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.library.versions({ artifact }),
    queryFn: () => fetchLibraryVersionsApi({ pathParams: { artifact } }),
    enabled: !!artifact && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
