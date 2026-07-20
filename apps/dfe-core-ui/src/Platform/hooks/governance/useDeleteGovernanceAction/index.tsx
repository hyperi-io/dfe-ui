import { GOVERNANCE_ACTIONS_QUERY_KEY } from '@/Platform/hooks/governance/useFetchGovernanceActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGovernanceActionApi } from './api';

export const useDeleteGovernanceAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (name: string) =>
      deleteGovernanceActionApi({ pathParams: { name: name } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: GOVERNANCE_ACTIONS_QUERY_KEY(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
