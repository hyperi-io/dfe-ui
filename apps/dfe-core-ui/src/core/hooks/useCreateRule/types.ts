import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createRulePath } from './api';

export type TRuleCreateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createRulePath, 'post'>
>;
export type TRuleCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createRulePath, 'post'>
>;
