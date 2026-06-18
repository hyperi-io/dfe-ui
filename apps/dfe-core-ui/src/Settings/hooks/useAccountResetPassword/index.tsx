import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import {
  AccountResetPasswordRequestBody,
  AccountResetPasswordResponse,
} from './types';

interface UseAccountResetPasswordProps {
  username: string;
  onSuccess?: (data: AccountResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

export const useAccountResetPassword = ({
  username,
  onSuccess,
  onError,
}: UseAccountResetPasswordProps) => {
  const { data, mutate, isPending, error } = useMutation<
    AccountResetPasswordResponse,
    Error,
    AccountResetPasswordRequestBody
  >({
    mutationFn: async (body) => {
      const response = await apiClient.post(API_CONFIG.accounts.resetPassword, {
        body,
        pathParams: { username },
      });
      return (response ?? {}) as AccountResetPasswordResponse;
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
