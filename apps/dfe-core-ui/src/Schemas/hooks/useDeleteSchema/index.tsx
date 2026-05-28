import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

interface UseDeleteSchemaProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useDeleteSchema = ({
  onSuccess,
  onError,
}: UseDeleteSchemaProps) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (schemaPath: string) => {
      return apiClient.delete(API_CONFIG.schemas.schema, {
        pathParams: { schema_path: schemaPath },
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
