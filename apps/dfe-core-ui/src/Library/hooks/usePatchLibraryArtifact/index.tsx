import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchLibraryArtifactApi } from './api';
import {
  TPatchLibraryArtifactRequest,
  TPatchLibraryArtifactResponse,
} from './types';

import { LIBRARY_ARTIFACT_QUERY_KEY } from '@/Library/hooks/useFetchLibraryArtifactDetail';

/**
 * Edit an artefact's description, labels or group.
 *
 * Metadata never creates a version - versions are content, and a relabel is
 * not a republish.
 */
export const usePatchLibraryArtifact = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TPatchLibraryArtifactResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TPatchLibraryArtifactRequest) =>
      patchLibraryArtifactApi({ body, pathParams: { artifact } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: ['library-artifacts'] });
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
