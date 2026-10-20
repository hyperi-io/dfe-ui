import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryVersionDetailApi } from './api';

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
    queryKey: QUERY_KEYS.library.version({ artifact, version }),
    queryFn: () =>
      fetchLibraryVersionDetailApi({
        pathParams: { artifact, version: version ?? 0 },
      }),
    enabled: !!artifact && version !== null && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
