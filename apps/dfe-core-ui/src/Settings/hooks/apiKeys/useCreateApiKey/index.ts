import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiKey } from './api';
import { TApiKeyCreateRequestBody, TApiKeyCreateResponse } from './types';

interface UseCreateApiKeyProps {
  onSuccess?: (data: TApiKeyCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateApiKey = ({
  onSuccess,
  onError,
}: UseCreateApiKeyProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TApiKeyCreateRequestBody) =>
      createApiKey({
        body,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.apiKeys.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
    reset,
  };
};
