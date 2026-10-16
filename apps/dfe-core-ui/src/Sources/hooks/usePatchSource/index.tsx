import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
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
        queryKey: QUERY_KEYS.sources.source({ name: response.source }),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.default(),
      });
      onSuccess?.(response);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
