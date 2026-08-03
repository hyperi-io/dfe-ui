import { DEPLOYMENTS_QUERY_KEY } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDeployment } from './api';

export const useDeleteDeployment = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

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
      void queryClient.invalidateQueries({ queryKey: DEPLOYMENTS_QUERY_KEY() });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
