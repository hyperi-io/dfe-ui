import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryArtifactDetailApi } from './api';

/** One artefact's mutable metadata plus its current version. */
export const useFetchLibraryArtifactDetail = ({
  artifact,
  queryEnabled = true,
}: {
  artifact: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.library.artifact({ artifact }),
    queryFn: () => fetchLibraryArtifactDetailApi({ pathParams: { artifact } }),
    enabled: !!artifact && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
