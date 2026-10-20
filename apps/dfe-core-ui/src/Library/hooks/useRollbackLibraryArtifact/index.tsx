import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rollbackLibraryArtifactApi } from './api';
import {
  TRollbackLibraryArtifactRequest,
  TRollbackLibraryArtifactResponse,
} from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

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
        queryKey: QUERY_KEYS.library.versions({ artifact }),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.artifact({ artifact }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
