import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppFileApi } from './api';
import { TDeleteAppFileResponse } from './types';

import { APP_FILES_QUERY_KEY } from '@/Apps/hooks/files/useFetchAppFiles';

/** Remove a file the app consumes, and any library link that produced it. */
export const useDeleteAppFile = ({
  service,
  instance,
  setName,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  onSuccess?: (values: TDeleteAppFileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (filename: string) =>
      deleteAppFileApi({
        pathParams: { service, instance, set_name: setName, filename },
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
