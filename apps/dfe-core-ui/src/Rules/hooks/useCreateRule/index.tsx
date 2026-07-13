import { useMutation } from '@tanstack/react-query';
import { createRule } from './api';
import { TRuleCreateRequest, TRuleCreateResponse } from './types';

interface UseCreateRuleProps {
  onSuccess?: (data: TRuleCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateRule = ({
  onSuccess,
  onError,
}: UseCreateRuleProps = {}) => {
  const { data, mutate, reset, isPending, error } = useMutation({
    mutationFn: (rule: TRuleCreateRequest) => createRule({ body: rule }),
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
    reset,
    isPending,
    error,
  };
};
