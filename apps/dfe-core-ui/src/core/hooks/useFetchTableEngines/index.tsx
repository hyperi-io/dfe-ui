import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchTableEngines } from './api';

/** The table engines a source may select, from the dfe-schemas engine registry. */
export const useFetchTableEngines = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.sources.engines(),
    // The registry ships with the engine image, so it cannot change while the console is open.
    staleTime: Infinity,
    queryFn: ({ signal }) =>
      fetchTableEngines({
        queryParams: { per_page: 100 },
        signal,
      }),
  });

  return {
    data,
    isLoading,
    isError,
  };
};
