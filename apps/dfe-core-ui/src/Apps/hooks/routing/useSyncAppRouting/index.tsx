import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncAppRoutingApi } from './api';
import { TSyncAppRoutingResponse } from './types';

import { APP_ROUTING_QUERY_KEY } from '@/Apps/hooks/routing/useFetchAppRouting';

/** Rewrite the overlay's routing to what the sources currently compile to. */
export const useSyncAppRouting = ({
  service,
  instance,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  onSuccess?: (values: TSyncAppRoutingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => syncAppRoutingApi({ pathParams: { service, instance } }),
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
