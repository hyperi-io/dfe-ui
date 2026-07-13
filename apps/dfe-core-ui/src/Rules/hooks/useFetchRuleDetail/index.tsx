import { useQuery } from '@tanstack/react-query';
import { fetchRuleDetail } from './api';

export const RULE_DETAIL_QUERY_KEY = (name: string | null) => [
  'rule',
  ...(name ? [name] : []),
];
/**
 * useFetchRuleDetail
 * @param name - The name of the rule to fetch.
 * @returns The rule detail.
 */
export const useFetchRuleDetail = ({ name }: { name: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: RULE_DETAIL_QUERY_KEY(name),
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
