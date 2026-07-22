import { useQuery } from '@tanstack/react-query';
import { governanceActionsApi } from './api';

export const GOVERNANCE_ACTIONS_QUERY_KEY = () => ['governanceActions'];

export const useFetchGovernanceActions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: GOVERNANCE_ACTIONS_QUERY_KEY(),
    queryFn: () => governanceActionsApi(),
  });

  return { data, isLoading, error };
};
