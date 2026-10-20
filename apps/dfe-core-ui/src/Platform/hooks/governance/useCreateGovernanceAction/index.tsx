import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGovernanceActionApi } from './api';
import {
  TCreateGovernanceActionRequest,
  TCreateGovernanceActionResponse,
} from './types';

export const useCreateGovernanceAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TCreateGovernanceActionResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TCreateGovernanceActionRequest) =>
      createGovernanceActionApi({ body }),
    onSuccess: (values) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.governance.actions(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
