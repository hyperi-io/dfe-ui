import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planSource } from './api';
import { SourcePlanRequest, TSourcePlanResponse } from './types';

export const usePlanSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TSourcePlanResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name, version }: SourcePlanRequest) =>
      planSource({
        pathParams: {
          name,
        },
        queryParams: {
          version,
        },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.source({
          name: data.source_name,
          version: data.version,
        }),
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
  };
};
