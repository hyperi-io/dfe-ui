import { useQuery } from '@tanstack/react-query';
import { fetchTableEngines } from './api';

export const TABLE_ENGINES_QUERY_KEY = ['table-engines'];

/** The table engines a source may select, from the dfe-schemas engine registry. */
export const useFetchTableEngines = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: TABLE_ENGINES_QUERY_KEY,
    // The registry ships with the engine image, so it cannot change while the console is open.
    staleTime: Infinity,
    queryFn: ({ signal }) =>
      fetchTableEngines({
        queryParams: { per_page: 100 },
        signal,
      }),
  });

  return {
    engines: data?.items ?? [],
    isLoading,
    isError,
  };
};
