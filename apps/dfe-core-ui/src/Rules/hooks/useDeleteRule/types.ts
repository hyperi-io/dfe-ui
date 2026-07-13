import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { deleteRulePath } from './api';

export type TRuleDeleteResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deleteRulePath, 'delete'>
>;
