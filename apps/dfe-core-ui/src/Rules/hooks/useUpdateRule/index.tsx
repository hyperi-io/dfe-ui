import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RuleUpdateRequest, RuleUpdateResponse } from './types';

export const useUpdateRule = ({
  onSuccess,
  onError,
  rule_id,
}: {
  onSuccess?: (data: RuleUpdateResponse) => void;
  onError?: (error: Error) => void;
  rule_id: string;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: RuleUpdateRequest) =>
      apiClient.put(API_CONFIG.rules.rule, {
        body: rule,
        pathParams: { rule_id },
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
