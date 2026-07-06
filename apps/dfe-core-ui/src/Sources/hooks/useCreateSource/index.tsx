import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SourceCreateRequestBody, SourceCreateResponse } from './types';

interface UseCreateSourceProps {
  onSuccess?: (data: SourceCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateSource = ({
  onSuccess,
  onError,
}: UseCreateSourceProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (source: SourceCreateRequestBody) =>
      apiClient.post(API_CONFIG.sources.default, { body: source }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    mutate,
    isPending,
    error,
    reset,
  };
};
