import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { FieldMap } from './types';

interface UseCreateFieldMapProps {
  onSuccess?: (data: FieldMap) => void;
  onError?: (error: Error) => void;
}

export const useCreateFieldMap = ({
  onSuccess,
  onError,
}: UseCreateFieldMapProps = {}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (fieldMap: FieldMap) =>
      apiClient.post(API_CONFIG.fieldMaps.default, { body: fieldMap }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
