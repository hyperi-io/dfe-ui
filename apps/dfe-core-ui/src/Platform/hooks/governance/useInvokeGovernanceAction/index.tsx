import { useMutation } from '@tanstack/react-query';
import { invokeGovernanceActionApi } from './api';
import { TGovernanceActionInvokeResponse } from './types';

export const useInvokeGovernanceAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TGovernanceActionInvokeResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      invokeGovernanceActionApi({ pathParams: { name } }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
