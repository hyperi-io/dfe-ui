import { useMutation } from '@tanstack/react-query';
import { deleteGroup } from './api';

export const useDeleteGroup = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (group_name: string) =>
      deleteGroup({
        pathParams: { name: group_name },
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
