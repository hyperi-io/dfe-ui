import { HELM_FILE_VARIABLES_QUERY_KEY } from '@/Platform/hooks/helm/useFetchHelmFileVariables';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHelmFileVariableApi } from './api';

export const useDeleteHelmFileVariable = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ name, path }: { name: string; path: string }) =>
      deleteHelmFileVariableApi({ pathParams: { name, path } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: HELM_FILE_VARIABLES_QUERY_KEY(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
