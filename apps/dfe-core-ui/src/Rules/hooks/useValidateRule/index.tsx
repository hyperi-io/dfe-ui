import { useMutation } from '@tanstack/react-query';
import { validateRule } from './api';
import type { TSqlValidationRequest, TSqlValidationResponse } from './types';

interface UseValidateRuleProps {
  onSuccess?: (data: TSqlValidationResponse) => void;
  onError?: (error: Error) => void;
}

export const useValidateRule = ({
  onSuccess,
  onError,
}: UseValidateRuleProps = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TSqlValidationRequest) => validateRule({ body: rule }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error, reset };
};
