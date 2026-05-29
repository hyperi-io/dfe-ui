import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import {
  ElasticConverterRequest,
  ElasticConverterResponse,
} from './useElasticConvert';

export const useElasticConvert = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ElasticConverterResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (payload: ElasticConverterRequest) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      const response = await apiClient.post(API_CONFIG.schemas.elasticConvert, {
        body: formData,
      });

      return response;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
