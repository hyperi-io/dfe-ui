import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppInstanceApi } from './api';
import {
  TCreateAppInstanceRequest,
  TCreateAppInstanceResponse,
} from './types';

import { APPS_QUERY_KEY } from '@/Apps/hooks/instances/useFetchApps';

/**
 * Deploy an instance by creating its values overlay.
 *
 * The overlay's presence is what turns into an Argo Application, so this one
 * commit IS the deployment - there is no separate apply step to wait on.
 */
export const useCreateAppInstance = ({
  service,
  onSuccess,
  onError,
}: {
  service: string;
  onSuccess?: (values: TCreateAppInstanceResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCreateAppInstanceRequest) =>
      createAppInstanceApi({ body, pathParams: { service } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
