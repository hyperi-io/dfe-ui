import { GOVERNANCE_POLICIES_QUERY_KEY } from '@/Platform/hooks/governance/useFetchGovernancePolicies';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGovernancePolicyApi } from './api';

export const useDeleteGovernancePolicy = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      deleteGovernancePolicyApi({ pathParams: { name: name } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: GOVERNANCE_POLICIES_QUERY_KEY(),
      });

      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
