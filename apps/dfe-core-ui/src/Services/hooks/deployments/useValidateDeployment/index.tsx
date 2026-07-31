import { useMutation } from '@tanstack/react-query';
import { validateDeployment } from './api';
import {
  TValidateDeploymentRequestBody,
  TValidateDeploymentResponse,
} from './types';

interface UseValidateDeploymentProps {
  onSuccess?: (data: TValidateDeploymentResponse) => void;
  onError?: (error: Error) => void;
}

export const useValidateDeployment = ({
  onSuccess,
  onError,
}: UseValidateDeploymentProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      serviceName,
      instanceName,
      ...body
    }: TValidateDeploymentRequestBody) => {
      return validateDeployment({
        pathParams: { service: serviceName, instance: instanceName },
        body,
      });
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
