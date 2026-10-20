import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLibraryTagApi } from './api';
import { TDeleteLibraryTagResponse } from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

/** Remove a tag. The versions it pointed at are untouched. */
export const useDeleteLibraryTag = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TDeleteLibraryTagResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (tag: string) =>
      deleteLibraryTagApi({ pathParams: { artifact, tag } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.artifact({ artifact }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
