import { INFINITE_SCHEMAS_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSchemaVersion } from './api';

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
    mutationFn: ({
      schemaPath,
      version,
    }: {
      schemaPath: string;
      version: string;
    }) =>
      deleteSchemaVersion({
        pathParams: { schema_path: schemaPath, version },
      }),
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
