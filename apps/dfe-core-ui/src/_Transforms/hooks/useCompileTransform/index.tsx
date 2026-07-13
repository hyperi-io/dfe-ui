import { useMutation } from '@tanstack/react-query';
import { compileTransform } from './api';
import { TCompileTransformRequest, TCompileTransformResponse } from './types';

export const useCompileTransform = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TCompileTransformResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (transform: TCompileTransformRequest) =>
      compileTransform(transform),

    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
