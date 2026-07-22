import { useQuery } from '@tanstack/react-query';
import { governancePolicyDetailApi } from './api';

export const GOVERNANCE_POLICY_DETAIL_QUERY_KEY = ({
  name,
}: {
  name: string;
}) => ['governancePolicyDetail', ...(name ? [name] : [])];

export const useFetchGovernancePolicyDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: GOVERNANCE_POLICY_DETAIL_QUERY_KEY({ name }),
    queryFn: () =>
      governancePolicyDetailApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
