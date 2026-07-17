import { useMutation } from '@tanstack/react-query';
import { updateLifecycleApi } from './api';
import { TLifecycleRequest, TUpdateLifecycleResponse } from './types';

export const useUpdateLifecycle = ({
  name,
  onSuccess,
  onError,
}: {
  name: string;
  onSuccess?: (values: TUpdateLifecycleResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TLifecycleRequest) =>
      updateLifecycleApi({ body, pathParams: { name } }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
