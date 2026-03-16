import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SourceUpdateRequestBody, SourceUpdateResponse } from './types';

interface UseUpdateSourceProps {
  onSuccess?: (data: SourceUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateSource = ({
  onSuccess,
  onError,
}: UseUpdateSourceProps = {}) => {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (source: SourceUpdateRequestBody) =>
      apiClient.put(API_CONFIG.sources.source, {
        body: source,
        pathParams: { name: source.source },
      }),
    onSuccess: (data) => {
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
