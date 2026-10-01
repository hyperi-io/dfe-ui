import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from './api';
import { TAccountCreateRequestBody, TAccountCreateResponse } from './types';

interface UseCreateAccountProps {
  onSuccess?: (data: TAccountCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateAccount = ({
  onSuccess,
  onError,
}: UseCreateAccountProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: TAccountCreateRequestBody) =>
      createAccount({
        body: account,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.infiniteFiltered(),
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
  };
};
