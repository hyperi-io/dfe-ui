import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
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
          queryKey: QUERY_KEYS.sources.source({
            name: data.source_name,
            version: data.version,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sources.default(),
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
