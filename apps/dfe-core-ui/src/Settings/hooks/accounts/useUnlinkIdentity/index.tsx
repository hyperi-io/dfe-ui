import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unlinkIdentity } from './api';

/** Unlink an IdP sign-in from an account, then refetch that account and the account list. */
export const useUnlinkIdentity = ({
  onSuccess,
  username,
}: {
  onSuccess?: () => void;
  username: string;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    // The re-auth grant for *username*, which the engine requires on an unlink.
    mutationFn: ({ key, reauth }: { key: string; reauth: string }) =>
      unlinkIdentity({
        headerParams: { [REAUTH_HEADER]: reauth },
        pathParams: { key, username },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.account({ username }),
      });
      onSuccess?.();
    },
  });

  return { mutate, isPending, error };
};
