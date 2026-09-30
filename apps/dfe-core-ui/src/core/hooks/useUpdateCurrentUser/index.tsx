import { QUERY_KEYS } from '@/core/config/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCurrentUser } from './api';
import {
  TCurrentUserUpdateRequestBody,
  TCurrentUserUpdateResponse,
} from './types';

interface UseUpdateCurrentUserProps {
  onSuccess?: (data: TCurrentUserUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateCurrentUser = ({
  onSuccess,
  onError,
}: UseUpdateCurrentUserProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (user: TCurrentUserUpdateRequestBody) =>
      updateCurrentUser({
        body: user,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.accounts.me(),
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
