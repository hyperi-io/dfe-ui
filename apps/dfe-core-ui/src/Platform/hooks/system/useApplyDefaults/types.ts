import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { applyDefaultsPath } from './api';

export type TApplyDefaultsRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof applyDefaultsPath, 'post'>
>;

export type TApplyDefaultsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof applyDefaultsPath, 'post'>
>;
