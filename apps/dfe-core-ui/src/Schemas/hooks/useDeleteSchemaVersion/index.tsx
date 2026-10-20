import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSchemaVersion } from './api';

interface UseDeleteSchemaProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useDeleteSchemaVersion = ({
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
