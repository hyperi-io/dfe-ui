import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RuleCreateRequest, RuleCreateResponse } from './types';

interface UseCreateRuleProps {
  onSuccess?: (data: RuleCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateRule = ({
  onSuccess,
  onError,
}: UseCreateRuleProps = {}) => {
  const { data, mutate, reset, isPending, error } = useMutation({
    mutationFn: (rule: RuleCreateRequest) => {
      return apiClient.post(API_CONFIG.rules.default, { body: rule });
    },
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
