import { useMutation, useQueryClient } from '@tanstack/react-query';
import { relinkAppFilesApi } from './api';
import { TRelinkAppFilesResponse } from './types';

import { APP_FILES_QUERY_KEY } from '@/core/hooks/apps/files/useFetchAppFiles';
import { APP_FILE_LINKS_QUERY_KEY } from '@/core/hooks/apps/files/useFetchAppFileLinks';

/**
 * Re-resolve every link in the set to what its target now names.
 *
 * This is the fix-once-roll-everywhere half of the library: publish a new
 * artefact version, then relink the instances that point at it.
 */
export const useRelinkAppFiles = ({
  service,
  instance,
  setName,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  etag?: string | null;
  onSuccess?: (values: TRelinkAppFilesResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      relinkAppFilesApi({
        pathParams: { service, instance, set_name: setName },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: APP_FILES_QUERY_KEY(service, instance, setName),
      });
      queryClient.invalidateQueries({
        queryKey: APP_FILE_LINKS_QUERY_KEY(service, instance, setName),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
