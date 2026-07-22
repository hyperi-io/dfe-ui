import { GOVERNANCE_POLICIES_QUERY_KEY } from '@/Platform/hooks/governance/useFetchGovernancePolicies';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGovernancePolicyApi } from './api';
import {
  TCreateGovernancePolicyRequest,
  TCreateGovernancePolicyResponse,
} from './types';

export const useCreateGovernancePolicy = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TCreateGovernancePolicyResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TCreateGovernancePolicyRequest) =>
      createGovernancePolicyApi({ body }),
    onSuccess: (values) => {
      void queryClient.invalidateQueries({
        queryKey: GOVERNANCE_POLICIES_QUERY_KEY(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
