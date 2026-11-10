import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLibraryArtifactApi } from './api';
import { TDeleteLibraryArtifactResponse } from './types';

/**
 * Delete an artefact. Refused while any instance still links to it, which is
 * why the usage view sits beside this action.
 */
export const useDeleteLibraryArtifact = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TDeleteLibraryArtifactResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => deleteLibraryArtifactApi({ pathParams: { artifact } }),
    onSuccess: (values) => {
      // The deleted artefact's own detail, versions and usage calls would
      // 404, so drop them and refetch only the list.
      [
        QUERY_KEYS.library.artifact({ artifact }),
        QUERY_KEYS.library.usage({ artifact }),
        QUERY_KEYS.library.versions({ artifact }),
      ].forEach((queryKey) =>
        queryClient.removeQueries({ queryKey, exact: true }),
      );
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.library.version(),
        predicate: ({ queryKey }) => queryKey[4] === artifact,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.default(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
