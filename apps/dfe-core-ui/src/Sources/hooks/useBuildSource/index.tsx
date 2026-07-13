import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
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
    reset,
  };
};
