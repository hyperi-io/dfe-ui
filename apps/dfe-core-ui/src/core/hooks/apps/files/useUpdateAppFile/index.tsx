import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppFileApi } from './api';
import { TUpdateAppFileRequest, TUpdateAppFileResponse } from './types';

import { APP_FILES_QUERY_KEY } from '@/core/hooks/apps/files/useFetchAppFiles';
import { APP_FILE_QUERY_KEY } from '@/core/hooks/apps/files/useFetchAppFile';

/**
 * Add or replace a file the app consumes.
 *
 * The response carries the syntax-validation verdict as well as the commit, so
 * a save that was accepted but could not be checked reads differently from one
 * that was checked and passed.
 */
export const useUpdateAppFile = ({
  service,
  instance,
  setName,
  filename,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  filename: string;
  etag?: string | null;
  onSuccess?: (values: TUpdateAppFileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TUpdateAppFileRequest) =>
      updateAppFileApi({
        body,
        pathParams: { service, instance, set_name: setName, filename },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: APP_FILES_QUERY_KEY(service, instance, setName),
      });
      queryClient.invalidateQueries({
        queryKey: APP_FILE_QUERY_KEY(service, instance, setName, filename),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
