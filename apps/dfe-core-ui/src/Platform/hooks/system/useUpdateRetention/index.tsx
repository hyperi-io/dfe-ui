import { useMutation } from '@tanstack/react-query';
import { updateRetentionApi } from './api';
import { TUpdateRetentionRequest, TUpdateRetentionResponse } from './types';

export const useUpdateRetention = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TUpdateRetentionResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TUpdateRetentionRequest) =>
      updateRetentionApi({
        body,
      }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
