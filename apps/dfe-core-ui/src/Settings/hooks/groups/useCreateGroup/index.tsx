import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from './api';
import { TGroupCreateRequestBody, TGroupCreateResponse } from './types';

interface UseCreateGroupProps {
  /** The re-auth grant for this group, which the engine requires on a change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TGroupCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateGroup = ({
  reauth,
  onSuccess,
  onError,
}: UseCreateGroupProps = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (group: TGroupCreateRequestBody) =>
      createGroup({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        body: group,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.groups.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.default(),
      });
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
