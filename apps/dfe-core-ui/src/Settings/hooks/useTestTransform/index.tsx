import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { TestTransformRequest, TestTransformResponse } from './types';

export const useTestTransform = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TestTransformResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (transform: TestTransformRequest) =>
      apiClient.post(API_CONFIG.transforms.test, { body: transform }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
