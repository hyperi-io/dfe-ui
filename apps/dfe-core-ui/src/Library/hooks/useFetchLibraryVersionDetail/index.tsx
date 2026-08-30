import { useQuery } from '@tanstack/react-query';
import { fetchLibraryVersionDetailApi } from './api';

export const LIBRARY_VERSION_QUERY_KEY = (
  artifact: string,
  version: number | null,
) => [
  'library-version',
  artifact,
  ...(version === null ? [] : [String(version)]),
];

/** One immutable version, content included. */
export const useFetchLibraryVersionDetail = ({
  artifact,
  version,
  queryEnabled = true,
}: {
  artifact: string;
  version: number | null;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: LIBRARY_VERSION_QUERY_KEY(artifact, version),
    queryFn: () =>
      fetchLibraryVersionDetailApi({
        pathParams: { artifact, version: version ?? 0 },
      }),
    enabled: !!artifact && version !== null && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
