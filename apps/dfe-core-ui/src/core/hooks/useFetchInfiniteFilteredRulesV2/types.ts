import {
  DfeClientOperationFor,
  DfeClientRequestOptions,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteRulesPath } from './api';

export type TRuleListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteRulesPath, 'get'>
>;
export type TRuleListItem = TRuleListResponse['items'][number];

type RuleListRequestParams = DfeClientRequestOptions<
  typeof fetchInfiniteRulesPath,
  'get'
>['queryParams'];

export type UseFetchInfiniteFilteredRulesProps = RuleListRequestParams & {
  sort_by?: string;
  sort_order?: string;
};
