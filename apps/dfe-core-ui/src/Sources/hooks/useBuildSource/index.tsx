import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildSource } from './api';
import { TSourceBuildResponse } from './types';

export type BuildSourceVariables = {
  source_name: string;
  source_version: string;
};

export const BUILD_SOURCE_QUERY_KEY = (
  source_name: string,
  source_version: string,
) => [
  'build-source',
  ...(source_name ? [source_name] : []),
  ...(source_version ? [source_version] : []),
];

export const useBuildSource = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TSourceBuildResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ source_name, source_version }: BuildSourceVariables) => {
      return buildSource({
        pathParams: {
          name: source_name,
        },
        queryParams: {
          version: source_version,
        },
      });
    },
    onSuccess: (data) => {
      void Promise.all([
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
    reset,
  };
};
