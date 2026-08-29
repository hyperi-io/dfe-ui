import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppScalingApi } from './api';
import {
  TUpdateAppScalingRequest,
  TUpdateAppScalingResponse,
} from './types';

import { APP_SCALING_QUERY_KEY } from '@/Apps/hooks/scaling/useFetchAppScaling';

/**
 * Set the scaling dials. Every field is optional, so a partial update leaves
 * the dials it does not name alone.
 */
export const useUpdateAppScaling = ({
  service,
  instance,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  onSuccess?: (values: TUpdateAppScalingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TUpdateAppScalingRequest) =>
      updateAppScalingApi({ body, pathParams: { service, instance } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: APP_SCALING_QUERY_KEY(service, instance),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
