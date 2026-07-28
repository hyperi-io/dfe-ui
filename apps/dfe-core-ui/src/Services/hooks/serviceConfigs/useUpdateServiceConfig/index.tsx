import { useMutation } from '@tanstack/react-query';
import { updateServiceConfig } from './api';
import {
  TServiceConfigUpdateRequestBody,
  TServiceConfigUpdateResponse,
} from './types';

interface UseUpdateServiceConfigProps {
  onSuccess?: (data: TServiceConfigUpdateResponse) => void;
  onError?: (error: Error) => void;
  service_name: string;
  service_instance: string;
}

export const useUpdateServiceConfig = ({
  service_name: service,
  service_instance: instance,
  onSuccess,
  onError,
}: UseUpdateServiceConfigProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (serviceConfig: TServiceConfigUpdateRequestBody) =>
      updateServiceConfig({
        body: serviceConfig,
        pathParams: { service, instance },
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
