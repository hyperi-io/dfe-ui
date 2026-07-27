import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: TAccountCreateRequestBody) =>
      createAccount({
        body: account,
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
