import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppInstanceApi } from './api';
import { TCreateAppInstanceRequest, TCreateAppInstanceResponse } from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

/**
 * Deploy an instance by creating its values overlay.
 *
 * The overlay's presence is what turns into an Argo Application, so this one
 * commit IS the deployment - there is no separate apply step to wait on.
 */
export const useCreateAppInstance = ({
  service,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  etag?: string | null;
  onSuccess?: (values: TCreateAppInstanceResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCreateAppInstanceRequest) =>
      createAppInstanceApi({
        body,
        pathParams: { service },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps.instances() });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
