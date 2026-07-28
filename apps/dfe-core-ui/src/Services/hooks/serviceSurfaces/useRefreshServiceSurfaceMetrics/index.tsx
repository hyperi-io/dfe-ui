import { useMutation } from '@tanstack/react-query';
import { refreshServiceSurfaceMetrics } from './api';
import { TRefreshServiceSurfaceMetricsResponse } from './types';

interface UseRefreshServiceSurfaceMetricsProps {
  onSuccess?: (data: TRefreshServiceSurfaceMetricsResponse) => void;
  onError?: (error: Error) => void;
}

export const useRefreshServiceSurfaceMetrics = ({
  onSuccess,
  onError,
}: UseRefreshServiceSurfaceMetricsProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      refreshServiceSurfaceMetrics({
        pathParams: { name },
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
  };
};
