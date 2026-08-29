import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rollbackLibraryArtifactApi } from './api';
import {
  TRollbackLibraryArtifactRequest,
  TRollbackLibraryArtifactResponse,
} from './types';

import { LIBRARY_ARTIFACT_QUERY_KEY } from '@/Library/hooks/useFetchLibraryArtifactDetail';
import { LIBRARY_VERSIONS_QUERY_KEY } from '@/Library/hooks/useFetchLibraryVersions';

/**
 * Repoint `current` at an earlier version.
 *
 * History stays intact - a rollback moves the pointer, it does not remove the
 * version it moved away from.
 */
export const useRollbackLibraryArtifact = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TRollbackLibraryArtifactResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TRollbackLibraryArtifactRequest) =>
      rollbackLibraryArtifactApi({ body, pathParams: { artifact } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: LIBRARY_VERSIONS_QUERY_KEY(artifact),
      });
      queryClient.invalidateQueries({
        queryKey: LIBRARY_ARTIFACT_QUERY_KEY(artifact),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
