import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setLibraryTagApi } from './api';
import { TSetLibraryTagRequest, TSetLibraryTagResponse } from './types';

import { LIBRARY_ARTIFACT_QUERY_KEY } from '@/Library/hooks/useFetchLibraryArtifactDetail';

/**
 * Repoint a tag at a version.
 *
 * A tag only ever moves through this call, never as a side effect of
 * publishing - which is what makes linking to `stable` safe.
 */
export const useSetLibraryTag = ({
  artifact,
  onSuccess,
  onError,
}: {
  artifact: string;
  onSuccess?: (values: TSetLibraryTagResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: ({ tag, body }: { tag: string; body: TSetLibraryTagRequest }) =>
      setLibraryTagApi({ body, pathParams: { artifact, tag } }),
    onSuccess: (values) => {
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
