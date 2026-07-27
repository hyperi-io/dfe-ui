import { API_KEYS_QUERY_KEY } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeApiKey } from './api';

export const useRevokeApiKey = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (short_token: string) =>
      revokeApiKey({
        pathParams: { short_token },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: API_KEYS_QUERY_KEY(),
      });

      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
