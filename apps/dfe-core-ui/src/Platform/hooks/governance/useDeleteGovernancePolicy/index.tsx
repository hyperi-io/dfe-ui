import { useMutation } from '@tanstack/react-query';
import { deleteGovernancePolicyApi } from './api';

export const useDeleteGovernancePolicy = ({
  name,
  onSuccess,
  onError,
}: {
  name: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteGovernancePolicyApi({ pathParams: { name: name } }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
