import { useQuery } from '@tanstack/react-query';
import { fetchLibraryVersionsApi } from './api';

export const LIBRARY_VERSIONS_QUERY_KEY = (artifact: string) => [
  'library-versions',
  artifact,
];

/** An artefact's immutable version history. */
export const useFetchLibraryVersions = ({
  artifact,
  queryEnabled = true,
}: {
  artifact: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: LIBRARY_VERSIONS_QUERY_KEY(artifact),
    queryFn: () => fetchLibraryVersionsApi({ pathParams: { artifact } }),
    enabled: !!artifact && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
