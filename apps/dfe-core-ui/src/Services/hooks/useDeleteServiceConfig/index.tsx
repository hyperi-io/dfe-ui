import { useMutation } from '@tanstack/react-query';
import { deleteServiceConfig } from './api';

export const useDeleteServiceConfig = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      service_name: service,
      service_instance: instance,
    }: {
      service_name: string;
      service_instance: string;
    }) =>
      deleteServiceConfig({
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
