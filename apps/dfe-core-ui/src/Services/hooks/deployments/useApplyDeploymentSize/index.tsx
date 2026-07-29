import { useMutation } from '@tanstack/react-query';
import { applyDeploymentSize } from './api';
import {
  TApplyDeploymentSizeRequestBody,
  TApplyDeploymentSizeResponse,
} from './types';

interface UseApplyDeploymentSizeProps {
  onSuccess?: (data: TApplyDeploymentSizeResponse) => void;
  onError?: (error: Error) => void;
}

export const useApplyDeploymentSize = ({
  onSuccess,
  onError,
}: UseApplyDeploymentSizeProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      service,
      instance,
      size,
    }: TApplyDeploymentSizeRequestBody) => {
      return applyDeploymentSize({
        pathParams: { service, instance, size },
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
