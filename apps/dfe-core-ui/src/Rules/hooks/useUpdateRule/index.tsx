import { useMutation } from '@tanstack/react-query';
import { updateRule } from './api';
import { TRuleUpdateRequest, TRuleUpdateResponse } from './types';

export const useUpdateRule = ({
  onSuccess,
  onError,
  name,
}: {
  onSuccess?: (data: TRuleUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TRuleUpdateRequest) =>
      updateRule({
        body: rule,
        pathParams: { name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
    reset,
  };
};
