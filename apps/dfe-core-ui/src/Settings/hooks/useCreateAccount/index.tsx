import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { AccountCreateRequestBody, AccountCreateResponse } from './types';

interface UseCreateAccountProps {
  onSuccess?: (data: AccountCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateAccount = ({
  onSuccess,
  onError,
}: UseCreateAccountProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: AccountCreateRequestBody) => {
      return apiClient.post(API_CONFIG.accounts.default, {
        body: account,
      });
    },
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
  };
};
