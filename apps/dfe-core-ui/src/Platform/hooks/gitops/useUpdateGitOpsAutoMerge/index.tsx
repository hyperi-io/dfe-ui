import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gitOpsAutoMergeApi } from './api';
import { TGitOpsAutoMergeRequest, TGitOpsAutoMergeResponse } from './types';

export const useUpdateGitOpsAutoMerge = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TGitOpsAutoMergeResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TGitOpsAutoMergeRequest) => gitOpsAutoMergeApi({ body }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.gitops.autoMerge(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
