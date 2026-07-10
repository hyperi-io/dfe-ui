import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { AlertUpdateRequest, AlertUpdateResponse } from './types';

export const useUpdateAlert = ({
  name,
  onSuccess,
  onError,
}: {
  onSuccess?: (data: AlertUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (alert: AlertUpdateRequest) =>
      apiClient.put(API_CONFIG.alerts.destination, {
        body: alert,
        pathParams: { name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
