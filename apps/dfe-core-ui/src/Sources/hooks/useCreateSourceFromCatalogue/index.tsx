import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
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
    mutationFn: ({ body }: CreateSourceFromCatalogueRequest) =>
      createSourceFromCatalogue({ body }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error, reset };
};
