import { DEPLOYMENT_DETAIL_QUERY_KEY } from '@/Services/hooks/deployments/useFetchDeploymentDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDeployment } from './api';
import {
  TDeploymentUpdateRequestBody,
  TDeploymentUpdateResponse,
} from './types';

interface UseUpdateDeploymentProps {
  onSuccess?: (data: TDeploymentUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateDeployment = ({
  onSuccess,
  onError,
}: UseUpdateDeploymentProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      serviceName,
      instanceName,
      ...body
    }: TDeploymentUpdateRequestBody) =>
      updateDeployment({
        body,
        pathParams: {
          service: serviceName,
          instance: instanceName,
        },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: DEPLOYMENT_DETAIL_QUERY_KEY(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
