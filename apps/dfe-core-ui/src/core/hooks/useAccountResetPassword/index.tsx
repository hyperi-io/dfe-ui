import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from './api';
import {
  TAccountResetPasswordRequestBody,
  TAccountResetPasswordResponse,
} from './types';

interface UseAccountResetPasswordProps {
  /** The re-auth grant for *username*, which the engine requires on a reset, read when the request goes out. */
  reauth?: () => string | undefined;
  username: string;
  onSuccess?: (data: TAccountResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

export const useAccountResetPassword = ({
  reauth,
  username,
  onSuccess,
  onError,
}: UseAccountResetPasswordProps) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TAccountResetPasswordRequestBody) =>
      resetPassword({
        body,
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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
    reset,
  };
};
