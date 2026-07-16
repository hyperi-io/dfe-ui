import { QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOidcProvider } from './api';

export const useDeleteOidcProvider = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (name: string) =>
      deleteOidcProvider({
        pathParams: { name: name },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
