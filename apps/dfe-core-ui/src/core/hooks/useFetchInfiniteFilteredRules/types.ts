import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteRulesPath } from './api';

export type TRuleListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteRulesPath, 'get'>
>;
export type TRuleListItem = TRuleListResponse['items'][number];

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
