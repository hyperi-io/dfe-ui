import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { governancePolicyDetailApi } from './api';

export const useFetchGovernancePolicyDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.governance.policy({ name }),
    queryFn: () =>
      governancePolicyDetailApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
