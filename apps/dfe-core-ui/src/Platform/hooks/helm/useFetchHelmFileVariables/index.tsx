import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchHelmFileVariablesApi } from './api';

export const useFetchHelmFileVariables = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.helm.fileVariables({ name }),
    queryFn: () =>
      fetchHelmFileVariablesApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
