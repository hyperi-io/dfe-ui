import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { TriggerRequest, TriggerResponse } from './types';

export const useTriggerHunt = ({
  onSuccess,
  onError,
  hunt_id,
}: {
  hunt_id: string;
  onSuccess?: (data: TriggerResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (triggerRequest: TriggerRequest) => {
      return apiClient.post(API_CONFIG.hunts.huntRun, {
        pathParams: { hunt_id },
        body: triggerRequest,
      });
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
