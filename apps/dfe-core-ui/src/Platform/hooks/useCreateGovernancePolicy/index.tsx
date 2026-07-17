import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TCreateGovernancePolicyRequest) =>
      createGovernancePolicyApi({ body }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
