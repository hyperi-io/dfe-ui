import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateSourcePath } from './api';

export type TSourceUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateSourcePath, 'put'>
>;

export type TSourceUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateSourcePath, 'put'>
>;
