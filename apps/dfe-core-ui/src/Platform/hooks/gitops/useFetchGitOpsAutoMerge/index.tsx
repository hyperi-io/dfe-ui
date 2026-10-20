import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { gitOpsAutoMergeApi } from './api';

export const useFetchGitOpsAutoMerge = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.gitops.autoMerge(),
    queryFn: () => gitOpsAutoMergeApi(),
  });

  return { data, isLoading, error };
};
