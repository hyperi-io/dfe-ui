import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (deployment: TDeploymentUpdateRequestBody) =>
      updateDeployment({
        body: deployment,
        pathParams: {
          service: deployment.service,
          instance: deployment.instance,
        },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
