import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { governancePoliciesApi } from './api';

export const useFetchGovernancePolicies = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.governance.policies(),
    queryFn: () => governancePoliciesApi(),
  });

  return { data, isLoading, error };
};
