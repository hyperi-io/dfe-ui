import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createHuntPath } from './api';

export type THuntCreateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createHuntPath, 'post'>
>;
export type THuntCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createHuntPath, 'post'>
>;
