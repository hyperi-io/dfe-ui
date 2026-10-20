import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reconcileGovernanceChRbacApi } from './api';
import { TReconcileGovernanceChRbacResponse } from './types';

export const useReconcileGovernanceChRbac = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TReconcileGovernanceChRbacResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => reconcileGovernanceChRbacApi(),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.governance.reconcileChRbac(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
