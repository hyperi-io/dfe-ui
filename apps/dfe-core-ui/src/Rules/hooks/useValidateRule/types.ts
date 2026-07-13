import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { validateRulePath } from './api';

export type TSqlValidationRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof validateRulePath, 'post'>
>;
export type TSqlValidationResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof validateRulePath, 'post'>
>;
