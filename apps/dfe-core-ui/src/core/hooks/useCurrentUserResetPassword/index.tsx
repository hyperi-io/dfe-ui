import { useMutation } from '@tanstack/react-query';
import { resetCurrentUserPassword } from './api';
import {
  TCurrentUserResetPasswordRequestBody,
  TCurrentUserResetPasswordResponse,
} from './types';

interface UseCurrentUserResetPasswordProps {
  onSuccess?: (data: TCurrentUserResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}
export const useCurrentUserResetPassword = ({
  onSuccess,
  onError,
}: UseCurrentUserResetPasswordProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TCurrentUserResetPasswordRequestBody) =>
      resetCurrentUserPassword({
        body,
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
