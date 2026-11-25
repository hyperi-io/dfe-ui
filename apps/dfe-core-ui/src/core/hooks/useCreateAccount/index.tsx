import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from './api';
import { TAccountCreateRequestBody, TAccountCreateResponse } from './types';

interface UseCreateAccountProps {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TAccountCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateAccount = ({
  reauth,
  onSuccess,
  onError,
}: UseCreateAccountProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (account: TAccountCreateRequestBody) =>
      createAccount({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        body: account,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
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
