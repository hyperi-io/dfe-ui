import { QUERY_KEY_SERVICE_CONFIG_DETAIL } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      serviceName,
      instanceName,
      ...body
    }: TServiceConfigUpdateRequestBody) =>
      updateServiceConfig({
        body,
        pathParams: {
          service: serviceName,
          instance: instanceName,
        },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_SERVICE_CONFIG_DETAIL(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
