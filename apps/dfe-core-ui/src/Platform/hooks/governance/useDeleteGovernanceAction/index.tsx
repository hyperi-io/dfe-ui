import { useMutation } from '@tanstack/react-query';
import { deleteGovernanceActionApi } from './api';

export const useDeleteGovernanceAction = ({
  name,
  onSuccess,
  onError,
}: {
  name: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteGovernanceActionApi({ pathParams: { name: name } }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
