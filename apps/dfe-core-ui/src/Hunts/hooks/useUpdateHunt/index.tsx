import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { HuntUpdateRequest, HuntUpdateResponse } from './types';

export const useUpdateHunt = ({
  hunt_id,
  onSuccess,
  onError,
}: {
  hunt_id: string;
  onSuccess?: (data: HuntUpdateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (hunt: HuntUpdateRequest) =>
      apiClient.put(API_CONFIG.hunts.hunt, {
        body: hunt,
        pathParams: { hunt_id },
      }),
    onSuccess: (data) => {
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
