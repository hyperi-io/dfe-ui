import { useQuery } from '@tanstack/react-query';
import { governancePoliciesApi } from './api';

export const GOVERNANCE_POLICIES_QUERY_KEY = () => ['governancePolicies'];

export const useFetchGovernancePolicies = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: GOVERNANCE_POLICIES_QUERY_KEY(),
    queryFn: () => governancePoliciesApi(),
  });

  return { data, isLoading, error };
};
