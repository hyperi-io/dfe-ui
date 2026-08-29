import { useQuery } from '@tanstack/react-query';
import { fetchLibraryArtifactDetailApi } from './api';

export const LIBRARY_ARTIFACT_QUERY_KEY = (artifact: string) => [
  'library-artifact',
  artifact,
];

/** One artefact's mutable metadata plus its current version. */
export const useFetchLibraryArtifactDetail = ({
  artifact,
  queryEnabled = true,
}: {
  artifact: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: LIBRARY_ARTIFACT_QUERY_KEY(artifact),
    queryFn: () =>
      fetchLibraryArtifactDetailApi({ pathParams: { artifact } }),
    enabled: !!artifact && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
