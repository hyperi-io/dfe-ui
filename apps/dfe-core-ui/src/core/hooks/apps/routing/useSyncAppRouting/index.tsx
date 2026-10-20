import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncAppRoutingApi } from './api';
import { TSyncAppRoutingResponse } from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

/** Rewrite the overlay's routing to what the sources currently compile to. */
export const useSyncAppRouting = ({
  service,
  instance,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  etag?: string | null;
  onSuccess?: (values: TSyncAppRoutingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      syncAppRoutingApi({
        pathParams: { service, instance },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.apps.routing({ service, instance }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
