import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppConfigApi } from './api';
import { TUpdateAppConfigRequest, TUpdateAppConfigResponse } from './types';

import { APP_CONFIG_QUERY_KEY } from '@/core/hooks/apps/config/useFetchAppConfig';

/**
 * Write options the app declares, and environment keys it does not.
 *
 * `changes` carries one entry per option the operator actually edited, keyed by
 * the path the read reports. A `config.*` key is judged against the app's own
 * schema and an `extraEnv.<NAME>` key as an environment name, both before
 * anything is committed, so a refused write leaves the deploy repo untouched.
 *
 * Pass the `etag` from the paired read to have the write refused if the deploy
 * repo moved since.
 */
export const useUpdateAppConfig = ({
  service,
  instance,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  etag?: string | null;
  onSuccess?: (values: TUpdateAppConfigResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TUpdateAppConfigRequest) =>
      updateAppConfigApi({
        body,
        pathParams: { service, instance },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: APP_CONFIG_QUERY_KEY(service, instance),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
