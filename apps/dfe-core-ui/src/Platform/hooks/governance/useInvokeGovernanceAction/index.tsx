import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeGovernanceActionApi } from './api';
import { TGovernanceActionInvokeResponse } from './types';

export const useInvokeGovernanceAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TGovernanceActionInvokeResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      invokeGovernanceActionApi({ pathParams: { name } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
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
