import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccount } from './api';
import { TAccountUpdateRequestBody, TAccountUpdateResponse } from './types';

interface UseUpdateAccountProps {
  onSuccess?: (data: TAccountUpdateResponse) => void;
  onError?: (error: Error) => void;
  username: string;
}

export const useUpdateAccount = ({
  username,
  onSuccess,
  onError,
}: UseUpdateAccountProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: TAccountUpdateRequestBody) =>
      updateAccount({
        body: account,
        pathParams: { username },
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

  return { data, mutate, isPending, error };
};
