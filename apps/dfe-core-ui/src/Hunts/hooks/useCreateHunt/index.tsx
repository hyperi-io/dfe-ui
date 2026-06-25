import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { HuntCreateRequest, HuntCreateResponse } from './types';

export const useCreateHunt = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: HuntCreateResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (hunt: HuntCreateRequest) =>
      apiClient.post(API_CONFIG.hunts.default, { body: hunt }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
