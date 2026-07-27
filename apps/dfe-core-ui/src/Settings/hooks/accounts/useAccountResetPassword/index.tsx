import { useMutation } from '@tanstack/react-query';
import { resetPassword } from './api';
import {
  TAccountResetPasswordRequestBody,
  TAccountResetPasswordResponse,
} from './types';

interface UseAccountResetPasswordProps {
  username: string;
  onSuccess?: (data: TAccountResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

export const useAccountResetPassword = ({
  username,
  onSuccess,
  onError,
}: UseAccountResetPasswordProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TAccountResetPasswordRequestBody) =>
      resetPassword({
        body,
        pathParams: { username },
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
  };
};
