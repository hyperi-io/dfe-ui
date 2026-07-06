import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SourcePlanRequest, SourcePlanResponse } from './types';

export const usePlanSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SourcePlanResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name, version }: SourcePlanRequest) => {
      return apiClient.post(API_CONFIG.sources.plan, {
        pathParams: {
          name,
        },
        queryParams: {
          version,
        },
      });
    },
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
