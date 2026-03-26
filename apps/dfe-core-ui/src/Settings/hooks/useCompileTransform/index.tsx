import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { CompileTransformRequest, CompileTransformResponse } from './types';

export const useCompileTransform = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CompileTransformResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (transform: CompileTransformRequest) =>
      apiClient.post(API_CONFIG.transforms.compile, { body: transform }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
