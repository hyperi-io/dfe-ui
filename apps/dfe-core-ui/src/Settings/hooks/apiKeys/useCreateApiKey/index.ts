import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiKey } from './api';
import { TApiKeyCreateRequestBody, TApiKeyCreateResponse } from './types';

interface UseCreateApiKeyProps {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TApiKeyCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateApiKey = ({
  reauth,
  onSuccess,
  onError,
}: UseCreateApiKeyProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TApiKeyCreateRequestBody) =>
      createApiKey({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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
