import { useMutation } from '@tanstack/react-query';
import { gitOpsAutoMergeApi } from './api';
import { TGitOpsAutoMergeRequest, TGitOpsAutoMergeResponse } from './types';

export const useUpdateGitOpsAutoMerge = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TGitOpsAutoMergeResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TGitOpsAutoMergeRequest) => gitOpsAutoMergeApi({ body }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
