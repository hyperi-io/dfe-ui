import { useMutation } from '@tanstack/react-query';
import { deleteHelmFileVariableApi } from './api';

export const useDeleteHelmFileVariable = ({
  name,
  path,
  onSuccess,
  onError,
}: {
  name: string;
  path: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteHelmFileVariableApi({ pathParams: { name, path } }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
