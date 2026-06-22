import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

export type BuildSourceVariables = {
  source_name: string;
  source_version: string;
};

export const useBuildSource = () => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ source_name, source_version }: BuildSourceVariables) => {
      return apiClient.post(API_CONFIG.sources.sourceBuild, {
        pathParams: {
          name: source_name,
        },
        queryParams: {
          version: source_version,
        },
      });
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
