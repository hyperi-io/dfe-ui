import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createFieldMapPath } from './api';

export type TCreateFieldMapRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createFieldMapPath, 'post'>
>;
export type TCreateFieldMapResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createFieldMapPath, 'post'>
>;
