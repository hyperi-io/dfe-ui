import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createSourcePath } from './api';

export type TCreateSourceRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createSourcePath, 'post'>
>;

export type TCreateSourceResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createSourcePath, 'post'>
>;
