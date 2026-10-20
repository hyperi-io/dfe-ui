import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { governanceActionsApi } from './api';

export const useFetchGovernanceActions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.governance.actions(),
    queryFn: () => governanceActionsApi(),
  });

  return { data, isLoading, error };
};
