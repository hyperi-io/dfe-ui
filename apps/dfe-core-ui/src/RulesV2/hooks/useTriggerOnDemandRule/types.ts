import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { triggerOnDemandRulePath } from './api';

export type TTriggerOnDemandRuleRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof triggerOnDemandRulePath, 'post'>
>;

export type TTriggerOnDemandRuleResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof triggerOnDemandRulePath, 'post'>
>;
