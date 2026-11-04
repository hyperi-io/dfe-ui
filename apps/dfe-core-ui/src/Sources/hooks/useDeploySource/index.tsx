import { sourcesQueries } from '@/core/config/api/endpoints/queryKeys';
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
          ...sourcesQueries,
        }),
        queryClient.invalidateQueries({
          ...sourcesQueries,
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
