import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDeleteSourceProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteSource = ({
  onSuccess,
  onError,
}: UseDeleteSourceProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (source: string) => {
      return apiClient.delete(API_CONFIG.sources.source, {
        pathParams: { name: source },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
