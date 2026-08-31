import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncAppRoutingApi } from './api';
import { TSyncAppRoutingResponse } from './types';

import { APP_ROUTING_QUERY_KEY } from '@/core/hooks/apps/routing/useFetchAppRouting';

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
        queryKey: APP_ROUTING_QUERY_KEY(service, instance),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
