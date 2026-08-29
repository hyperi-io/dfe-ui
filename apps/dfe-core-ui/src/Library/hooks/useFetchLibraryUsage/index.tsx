import { useQuery } from '@tanstack/react-query';
import { fetchLibraryUsageApi } from './api';

export const LIBRARY_USAGE_QUERY_KEY = (artifact: string) => [
  'library-usage',
  artifact,
];

/**
 * Which instances link to this artefact, and at which version.
 *
 * This is what makes the library worth having: fixing an artefact once tells
 * you exactly what needs relinking.
 */
export const useFetchLibraryUsage = ({
  artifact,
  queryEnabled = true,
}: {
  artifact: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: LIBRARY_USAGE_QUERY_KEY(artifact),
    queryFn: () => fetchLibraryUsageApi({ pathParams: { artifact } }),
    enabled: !!artifact && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
