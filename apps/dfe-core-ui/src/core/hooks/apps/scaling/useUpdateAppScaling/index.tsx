import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppScalingApi } from './api';
import { TUpdateAppScalingRequest, TUpdateAppScalingResponse } from './types';

import { APP_SCALING_QUERY_KEY } from '@/core/hooks/apps/scaling/useFetchAppScaling';

/**
 * Set the scaling dials. Every field is optional, so a partial update leaves
 * the dials it does not name alone.
 *
 * Pass the `etag` from the paired read to have the write refused if the deploy
 * repo moved since. Without one the write is unguarded, which is what a repo
 * with no commits yet needs.
 */
export const useUpdateAppScaling = ({
  service,
  instance,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  etag?: string | null;
  onSuccess?: (values: TUpdateAppScalingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TUpdateAppScalingRequest) =>
      updateAppScalingApi({
        body,
        pathParams: { service, instance },
        headerParams: { 'If-Match': etag },
      }),
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
