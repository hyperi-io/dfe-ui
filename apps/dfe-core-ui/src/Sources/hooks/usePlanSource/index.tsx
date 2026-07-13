import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
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
        queryKey: SOURCE_DETAIL_QUERY_KEY(data.source_name, data.version),
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
