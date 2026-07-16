import { useMutation } from '@tanstack/react-query';
import { deleteOidcProvider } from './api';

export const useDeleteOidcProvider = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (name: string) =>
      deleteOidcProvider({
        pathParams: { name: name },
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
