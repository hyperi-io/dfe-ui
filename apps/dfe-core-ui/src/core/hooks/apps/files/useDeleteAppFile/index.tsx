import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppFileApi } from './api';
import { TDeleteAppFileResponse } from './types';

import { APP_FILES_QUERY_KEY } from '@/core/hooks/apps/files/useFetchAppFiles';

/** Remove a file the app consumes, and any library link that produced it. */
export const useDeleteAppFile = ({
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
  onSuccess?: (values: TDeleteAppFileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (filename: string) =>
      deleteAppFileApi({
        pathParams: { service, instance, set_name: setName, filename },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: APP_FILES_QUERY_KEY(service, instance, setName),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
