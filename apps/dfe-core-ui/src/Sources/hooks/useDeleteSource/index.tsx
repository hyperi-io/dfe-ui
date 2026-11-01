import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSource } from './api';

export type TDeleteSourceResponse = Awaited<ReturnType<typeof deleteSource>>;

interface UseDeleteSourceProps {
  onSuccess?: (data: TDeleteSourceResponse) => void;
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
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sources.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error };
};
