import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { AccountUpdateRequestBody, AccountUpdateResponse } from './types';

interface UseUpdateAccountProps {
  onSuccess?: (data: AccountUpdateResponse) => void;
  onError?: (error: Error) => void;
  username: string;
}

export const useUpdateAccount = ({
  username,
  onSuccess,
  onError,
}: UseUpdateAccountProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: AccountUpdateRequestBody) => {
      return apiClient.put(API_CONFIG.accounts.account, {
        body: account,
        pathParams: { username },
      });
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
