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
      queryClient.invalidateQueries({ queryKey: ['library-artifacts'] });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
