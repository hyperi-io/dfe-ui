import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SourceCreateRequestBody, SourceCreateResponse } from './types';

interface UseCreateSourceProps {
  onSuccess?: (data: SourceCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateSource = ({
  onSuccess,
  onError,
}: UseCreateSourceProps = {}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (source: SourceCreateRequestBody) =>
      apiClient.post(API_CONFIG.sources.default, { body: source }),
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
  };
};
