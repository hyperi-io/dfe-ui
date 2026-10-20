import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setLibraryArtifactStateApi } from './api';
import {
  TSetLibraryArtifactStateRequest,
  TSetLibraryArtifactStateResponse,
} from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

/**
 * Move an artefact between enabled, disabled and deprecated.
 *
 * A lifecycle state is preferred over a delete precisely so the history of
 * what once deployed stays readable.
 */
export const useSetLibraryArtifactState = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TSetLibraryArtifactStateResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TSetLibraryArtifactStateRequest) =>
      setLibraryArtifactStateApi({ body, pathParams: { artifact } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.artifact(),
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
