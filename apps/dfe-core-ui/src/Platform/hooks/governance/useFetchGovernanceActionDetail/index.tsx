import { useQuery } from '@tanstack/react-query';
import { governanceActionDetailApi } from './api';

export const GOVERNANCE_ACTION_DETAIL_QUERY_KEY = ({
  name,
}: {
  name: string;
}) => ['governanceActionDetail', ...(name ? [name] : [])];

export const useFetchGovernanceActionDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: GOVERNANCE_ACTION_DETAIL_QUERY_KEY({ name }),
    queryFn: () =>
      governanceActionDetailApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
