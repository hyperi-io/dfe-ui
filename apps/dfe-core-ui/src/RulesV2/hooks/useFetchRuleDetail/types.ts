import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchRuleDetailPath } from './api';

export type TRuleDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchRuleDetailPath, 'get'>
>;
