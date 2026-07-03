import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SourcePlanRequest, SourcePlanResponse } from './types';

export const usePlanSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SourcePlanResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
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
