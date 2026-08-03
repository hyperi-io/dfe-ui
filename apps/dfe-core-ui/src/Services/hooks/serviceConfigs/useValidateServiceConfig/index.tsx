import { useMutation } from '@tanstack/react-query';
import { validateServiceConfig } from './api';
import {
  TValidateServiceConfigRequestBody,
  TValidateServiceConfigResponse,
} from './types';

interface UseValidateServiceConfigProps {
  onSuccess?: (data: TValidateServiceConfigResponse) => void;
  onError?: (error: Error) => void;
}

export const useValidateServiceConfig = ({
  onSuccess,
  onError,
}: UseValidateServiceConfigProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (payload: TValidateServiceConfigRequestBody) => {
      const { service, instance, ...body } =
        payload as TValidateServiceConfigRequestBody & {
          service: string;
          instance: string;
        };

      return validateServiceConfig({
        pathParams: { service, instance },
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
