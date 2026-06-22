import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';
/**
 * useFetchRuleDetail
 * @param rule_id - The ID of the rule to fetch.
 * @returns The rule detail.
 */
export const useFetchRuleDetail = ({ rule_id }: { rule_id: string | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rule', rule_id],
    queryFn: ({ signal }) =>
      apiClient.get(API_CONFIG.rules.rule, {
        pathParams: { rule_id: rule_id ?? '' },
        signal,
      }),
    enabled: !!rule_id,
  });

  return {
    data,
    isLoading,
    error,
  };
};
