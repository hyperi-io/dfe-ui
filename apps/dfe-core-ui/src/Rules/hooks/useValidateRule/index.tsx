import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import type { SqlValidationRequest, SqlValidationResponse } from './types';

interface UseValidateRuleProps {
  onSuccess?: (data: SqlValidationResponse) => void;
  onError?: (error: Error) => void;
}

export const useValidateRule = ({
  onSuccess,
  onError,
}: UseValidateRuleProps = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: SqlValidationRequest) =>
      apiClient.post(API_CONFIG.rules.validate, { body: rule }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error, reset };
};
