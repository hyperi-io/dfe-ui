import { useMutation } from '@tanstack/react-query';
import { revokeApiKey } from './api';

export const useRevokeApiKey = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (short_token: string) =>
      revokeApiKey({
        pathParams: { short_token },
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
