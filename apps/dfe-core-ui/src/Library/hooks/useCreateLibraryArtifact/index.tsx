import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLibraryArtifactApi } from './api';
import {
  TCreateLibraryArtifactRequest,
  TCreateLibraryArtifactResponse,
} from './types';

/**
 * Create an artefact, with or without a first version.
 *
 * Creating it empty is deliberate: metadata and rules are settled before any
 * content can enter.
 */
export const useCreateLibraryArtifact = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TCreateLibraryArtifactResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCreateLibraryArtifactRequest) =>
      createLibraryArtifactApi({ body }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.library.artifact(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
