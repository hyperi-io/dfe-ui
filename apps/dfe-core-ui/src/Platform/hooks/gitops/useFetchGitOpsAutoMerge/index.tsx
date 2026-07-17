import { useQuery } from '@tanstack/react-query';
import { gitOpsAutoMergeApi } from './api';

export const GIT_OPS_AUTO_MERGE_QUERY_KEY = () => ['gitOpsAutoMerge'];

export const useFetchGitOpsAutoMerge = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: GIT_OPS_AUTO_MERGE_QUERY_KEY(),
    queryFn: () => gitOpsAutoMergeApi(),
  });

  return { data, isLoading, error };
};
