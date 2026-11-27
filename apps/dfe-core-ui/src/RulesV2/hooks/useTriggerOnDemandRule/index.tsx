import { useMutation } from '@tanstack/react-query';
import { triggerOnDemandRule } from './api';
import {
  TTriggerOnDemandRuleRequest,
  TTriggerOnDemandRuleResponse,
} from './types';

// A run writes nothing, so it leaves every cached rule query as it is.
export const useTriggerOnDemandRule = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TTriggerOnDemandRuleResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TTriggerOnDemandRuleRequest) =>
      triggerOnDemandRule({
        body,
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
