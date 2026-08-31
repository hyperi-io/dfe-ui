import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppInstanceApi } from './api';
import { TDeleteAppInstanceResponse } from './types';

import { APPS_QUERY_KEY } from '@/core/hooks/apps/instances/useFetchApps';

/**
 * Undeploy an instance by removing its values overlay.
 *
 * Worth guarding: the delete takes the whole overlay with it, so a stale tab
 * can drop edits it never displayed.
 */
export const useDeleteAppInstance = ({
  service,
  instance,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  etag?: string | null;
  onSuccess?: (values: TDeleteAppInstanceResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      deleteAppInstanceApi({
        pathParams: { service, instance },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
