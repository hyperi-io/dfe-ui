import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOidcProviderGroups } from './api';
import { TSyncOidcProviderGroupsResponse } from './types';

interface UseSyncOidcProviderGroupsProps {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TSyncOidcProviderGroupsResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}

export const useSyncOidcProviderGroups = ({
  reauth,
  onSuccess,
  onError,
  name,
}: UseSyncOidcProviderGroupsProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      updateOidcProviderGroups({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        pathParams: { name },
      }),
    onSuccess: (data) => {
      // A sync that reaches the provider rewrites its last_sync_status, which the list carries.
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oidcProviders.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
