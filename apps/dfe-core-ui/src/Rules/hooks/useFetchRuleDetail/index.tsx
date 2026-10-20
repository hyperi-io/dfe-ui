import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchRuleDetail } from './api';

/**
 * useFetchRuleDetail
 * @param name - The name of the rule to fetch.
 * @returns The rule detail.
 */
export const useFetchRuleDetail = ({ name }: { name: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.rules.rule({ name }),
    queryFn: ({ signal }) =>
      fetchRuleDetail({
        pathParams: { name: name ?? '' },
        signal,
      }),
    enabled: !!name,
  });

  return {
    data,
    isLoading,
    error,
  };
};
