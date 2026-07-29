import { useMutation } from '@tanstack/react-query';
import { deleteDeployment } from './api';

export const useDeleteDeployment = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      service,
      instance,
    }: {
      service: string;
      instance: string;
    }) =>
      deleteDeployment({
        pathParams: { service, instance },
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
