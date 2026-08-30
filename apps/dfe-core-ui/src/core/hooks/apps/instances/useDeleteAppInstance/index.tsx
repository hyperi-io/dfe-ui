import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppInstanceApi } from './api';
import { TDeleteAppInstanceResponse } from './types';

import { APPS_QUERY_KEY } from '@/core/hooks/apps/instances/useFetchApps';

/** Undeploy an instance by removing its values overlay. */
export const useDeleteAppInstance = ({
  service,
  instance,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  onSuccess?: (values: TDeleteAppInstanceResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      deleteAppInstanceApi({ pathParams: { service, instance } }),
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
