import { useMutation } from '@tanstack/react-query';
import { deleteAlert } from './api';

export const useDeleteAlert = ({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (name: string) =>
      deleteAlert({
        pathParams: { name },
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
