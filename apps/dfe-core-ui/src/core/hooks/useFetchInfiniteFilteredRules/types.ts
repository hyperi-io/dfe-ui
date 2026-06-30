import { components } from '@repo/dfe-engine-types';

export type RuleListResponse =
  components['schemas']['PaginatedResponse_RuleSummary_'];
export type RuleListItem = RuleListResponse['items'][number];

export interface RuleListRequestParams {
  search?: string;
  severity?: string;
  source?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredRulesProps = Omit<
  RuleListRequestParams,
  'page'
>;
