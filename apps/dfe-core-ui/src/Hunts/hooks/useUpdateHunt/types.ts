import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateHuntPath } from './api';

export type THuntUpdateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateHuntPath, 'put'>
>;
export type THuntUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateHuntPath, 'put'>
>;
