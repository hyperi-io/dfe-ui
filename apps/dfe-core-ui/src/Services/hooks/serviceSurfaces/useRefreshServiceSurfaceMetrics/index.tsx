import { SERVICE_SURFACE_DETAIL_QUERY_KEY } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name }: { name: string }) =>
      refreshServiceSurfaceMetrics({
        pathParams: { name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: SERVICE_SURFACE_DETAIL_QUERY_KEY(data.service),
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
