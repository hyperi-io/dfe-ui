import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSchema } from './api';

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
    mutationFn: (schemaPath: string) =>
      deleteSchema({
        pathParams: { schema_path: schemaPath },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.schemas.default(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
