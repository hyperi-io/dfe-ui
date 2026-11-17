import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TRuleUpdateRequest) =>
      updateRule({
        body: rule,
        pathParams: { name },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rules.default(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rules.rule({ name }),
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
