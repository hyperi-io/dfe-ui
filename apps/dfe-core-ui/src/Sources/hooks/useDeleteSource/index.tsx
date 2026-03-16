import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

interface UseDeleteSourceProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteSource = ({
  onSuccess,
  onError,
}: UseDeleteSourceProps) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (source: string) => {
      return apiClient.delete(API_CONFIG.sources.source, {
        pathParams: { name: source },
      });
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
