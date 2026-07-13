import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchSource } from './api';
import { TSourcePatchRequestBody, TSourcePatchResponse } from './types';

export const usePatchSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (response: Omit<TSourcePatchResponse, 'path'>) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ name, ...source }: TSourcePatchRequestBody) =>
      patchSource({
        body: source,
        pathParams: { name },
      }),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(response.source),
      });
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      onSuccess?.(response);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
