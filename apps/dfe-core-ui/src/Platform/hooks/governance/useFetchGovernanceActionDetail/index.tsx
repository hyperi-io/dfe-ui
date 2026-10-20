import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { governanceActionDetailApi } from './api';

export const useFetchGovernanceActionDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.governance.action({ name }),
    queryFn: () =>
      governanceActionDetailApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
