import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deploySource } from './api';
import { SourceDeployRequest, TSourceDeployResponse } from './types';

export const useDeploySource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TSourceDeployResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name, version }: SourceDeployRequest) =>
      deploySource({
        pathParams: {
          name,
        },
        queryParams: {
          version,
        },
      }),
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
