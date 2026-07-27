import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TApiKeyCreateRequestBody) =>
      createApiKey({
        body,
      }),
    onSuccess: (data) => {
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
