import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateRulePath } from './api';

export type TRuleUpdateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateRulePath, 'put'>
>;

export type TRuleUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateRulePath, 'put'>
>;
