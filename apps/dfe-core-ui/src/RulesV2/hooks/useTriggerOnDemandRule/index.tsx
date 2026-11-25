import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerOnDemandRule } from './api';
import {
  TTriggerOnDemandRuleRequest,
  TTriggerOnDemandRuleResponse,
} from './types';

export const useTriggerOnDemandRule = ({
  onSuccess,
  onError,
  name,
}: {
  onSuccess?: (data: TTriggerOnDemandRuleResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TTriggerOnDemandRuleRequest) =>
      triggerOnDemandRule({
        body: rule,
        pathParams: { name },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rulesV2.default(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rulesV2.rule({ name }),
      });
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
