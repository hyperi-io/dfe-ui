import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RuleUpdateRequest, RuleUpdateResponse } from './types';

export const useUpdateRule = ({
  onSuccess,
  onError,
  name,
}: {
  onSuccess?: (data: RuleUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: RuleUpdateRequest) =>
      apiClient.put(API_CONFIG.rules.rule, {
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
