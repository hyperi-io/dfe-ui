import { useDebounce } from '@/core/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { fetchSourceCatalogue } from './api';
import { UseFetchSourceCatalogueProps } from './types';

const SEARCH_DEBOUNCE_MS = 300;

export const SOURCE_CATALOGUE_QUERY_KEY = (
  search?: string,
  intake?: string,
  page?: number,
  per_page?: number,
) => [
  'source-catalogue',
  ...(search ? [search] : []),
  ...(intake ? [intake] : []),
  ...(page ? [page] : []),
  ...(per_page ? [per_page] : []),
];

/**
 * The sources a deployed transform already handles, as the engine offers them.
 *
 * A deployment that mounts no catalogue answers with an empty page rather than
 * an error, so the caller shows "nothing to offer" and not a failure.
 */
export const useFetchSourceCatalogue = ({
  search,
  intake,
  page = 1,
  per_page = 20,
}: UseFetchSourceCatalogueProps = {}) => {
  const debouncedSearch = useDebounce(search ?? '', SEARCH_DEBOUNCE_MS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: SOURCE_CATALOGUE_QUERY_KEY(
      debouncedSearch,
      intake,
      page,
      per_page,
    ),
    queryFn: ({ signal }) =>
      fetchSourceCatalogue({
        queryParams: {
          search: debouncedSearch || undefined,
          intake,
          page,
          per_page,
        },
        signal,
      }),
  });

  return {
    entries: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    error,
  };
};
