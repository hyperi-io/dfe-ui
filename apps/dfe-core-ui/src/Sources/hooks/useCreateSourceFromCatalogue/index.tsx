import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSourceFromCatalogue } from './api';
import {
  CreateSourceFromCatalogueRequest,
  TCatalogueSourceResponse,
} from './types';

/**
 * Create a source from one catalogue entry.
 *
 * The engine compiles the entry into the same write body the source form
 * produces, so the response and the caches it invalidates are the create's.
 */
export const useCreateSourceFromCatalogue = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TCatalogueSourceResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ entry, body }: CreateSourceFromCatalogueRequest) =>
      createSourceFromCatalogue({ pathParams: { entry }, body }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(data.source, data.current),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error, reset };
};
