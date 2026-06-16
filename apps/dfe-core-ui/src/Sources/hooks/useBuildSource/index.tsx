import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

export const useBuildSource = () => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (source_name: string) => {
      return apiClient.post(API_CONFIG.sources.sourceBuild, {
        pathParams: {
          name: source_name,
        },
      });
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
