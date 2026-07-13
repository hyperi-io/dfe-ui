import { INFINITE_SOURCES_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSource } from './api';

interface UseDeleteSourceProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteSource = ({
  onSuccess,
  onError,
}: UseDeleteSourceProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (source: string) =>
      deleteSource({
        pathParams: { name: source },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SOURCES_QUERY_KEY(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
