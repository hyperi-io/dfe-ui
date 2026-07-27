import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (account: TAccountUpdateRequestBody) =>
      updateAccount({
        body: account,
        pathParams: { username },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
