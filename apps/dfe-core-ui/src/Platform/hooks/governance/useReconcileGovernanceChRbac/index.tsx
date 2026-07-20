import { useMutation } from '@tanstack/react-query';
import { reconcileGovernanceChRbacApi } from './api';
import { TReconcileGovernanceChRbacResponse } from './types';

export const useReconcileGovernanceChRbac = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TReconcileGovernanceChRbacResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => reconcileGovernanceChRbacApi(),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
