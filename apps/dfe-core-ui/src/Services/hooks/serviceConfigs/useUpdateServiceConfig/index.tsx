import { useMutation } from '@tanstack/react-query';
import { updateServiceConfig } from './api';
import {
  TServiceConfigUpdateRequestBody,
  TServiceConfigUpdateResponse,
} from './types';

interface UseUpdateServiceConfigProps {
  onSuccess?: (data: TServiceConfigUpdateResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateServiceConfig = ({
  onSuccess,
  onError,
}: UseUpdateServiceConfigProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      service,
      instance,
      config,
    }: TServiceConfigUpdateRequestBody) =>
      updateServiceConfig({
        body: { config },
        pathParams: {
          service,
          instance,
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
