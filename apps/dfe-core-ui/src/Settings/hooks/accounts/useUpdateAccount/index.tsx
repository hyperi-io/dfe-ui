import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccount } from './api';
import { TAccountUpdateRequestBody, TAccountUpdateResponse } from './types';

interface UseUpdateAccountProps {
  onSuccess?: (data: TAccountUpdateResponse) => void;
  onError?: (error: Error) => void;
  /** The re-auth grant for *username*, which the engine requires on an edit, read when the request goes out. */
  reauth?: () => string | undefined;
  username: string;
}

export const useUpdateAccount = ({
  username,
  onSuccess,
  onError,
  reauth,
}: UseUpdateAccountProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (account: TAccountUpdateRequestBody) =>
      updateAccount({
        body: account,
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        pathParams: { username },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.account({ username }),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
