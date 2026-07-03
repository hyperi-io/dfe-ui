import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SourceDeployRequest, SourceDeployResponse } from './types';

export const useDeploySource = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data: SourceDeployResponse) => void;
  onError: (error: Error) => void;
}) => {
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
      onSuccess(data);
    },
    onError: (error) => {
      onError(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
