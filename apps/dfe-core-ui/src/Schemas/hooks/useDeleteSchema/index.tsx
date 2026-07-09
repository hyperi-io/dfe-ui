import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SCHEMAS_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDeleteSchemaProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useDeleteSchema = ({
  onSuccess,
  onError,
}: UseDeleteSchemaProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (schemaPath: string) => {
      return apiClient.delete(API_CONFIG.schemas.schema, {
        pathParams: { schema_path: schemaPath },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SCHEMAS_QUERY_KEY(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
