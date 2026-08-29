import { useMutation, useQueryClient } from '@tanstack/react-query';
import { copyAppFilesApi } from './api';
import { TCopyAppFilesRequest, TCopyAppFilesResponse } from './types';

import { APPS_QUERY_KEY } from '@/Apps/hooks/instances/useFetchApps';

/**
 * Copy this instance's authored files onto another instance of the same app.
 *
 * Only the files move - the target keeps its own source binding, scaling and
 * identity - so reusing a transform on a second source is not a retype.
 */
export const useCopyAppFiles = ({
  service,
  instance,
  setName,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  onSuccess?: (values: TCopyAppFilesResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCopyAppFilesRequest) =>
      copyAppFilesApi({
        body,
        pathParams: { service, instance, set_name: setName },
      }),
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
