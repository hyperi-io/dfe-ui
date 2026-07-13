import { useMutation } from '@tanstack/react-query';
import { elasticConvert } from './api';
import { ElasticConverterFormData, TElasticConvertResponse } from './types';

export const useElasticConvert = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TElasticConvertResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (payload: ElasticConverterFormData) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      const response = await elasticConvert({
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
