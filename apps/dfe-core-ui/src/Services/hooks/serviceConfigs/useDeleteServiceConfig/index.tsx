import { QUERY_KEY_SERVICE_CONFIGS } from '@/Services/hooks/serviceConfigs/useFetchInfiniteFilteredServiceConfigs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteServiceConfig } from './api';

export const useDeleteServiceConfig = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

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
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_SERVICE_CONFIGS(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
