import { useQuery } from '@tanstack/react-query';
import { gitOpsLogApi } from './api';

export const GIT_OPS_LOG_QUERY_KEY = () => ['gitOpsLog'];

export const useFetchGitOpsLog = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: GIT_OPS_LOG_QUERY_KEY(),
    queryFn: () => gitOpsLogApi(),
  });

  return { data, isLoading, error };
};
