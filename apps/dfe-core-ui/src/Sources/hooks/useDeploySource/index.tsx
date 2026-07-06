import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SourceDeployRequest, SourceDeployResponse } from './types';

export const useDeploySource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SourceDeployResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name, version }: SourceDeployRequest) => {
      return apiClient.post(API_CONFIG.sources.deploy, {
        pathParams: {
          name,
        },
        queryParams: {
          version,
        },
      });
    },
    onSuccess: (data) => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: SOURCE_DETAIL_QUERY_KEY(data.source_name, data.version),
        }),
        queryClient.invalidateQueries({
          queryKey: INFINITE_SOURCES_QUERY_KEY(),
        }),
      ]);
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
