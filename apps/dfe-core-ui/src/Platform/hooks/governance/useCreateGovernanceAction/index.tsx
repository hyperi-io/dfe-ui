import { useMutation } from '@tanstack/react-query';
import { createGovernanceActionApi } from './api';
import {
  TCreateGovernanceActionRequest,
  TCreateGovernanceActionResponse,
} from './types';

export const useCreateGovernanceAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TCreateGovernanceActionResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TCreateGovernanceActionRequest) =>
      createGovernanceActionApi({ body }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
