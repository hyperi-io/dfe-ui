import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

export const useDeleteAlert = ({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (name: string) =>
      apiClient.delete(API_CONFIG.alerts.destination, {
        pathParams: { name },
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
