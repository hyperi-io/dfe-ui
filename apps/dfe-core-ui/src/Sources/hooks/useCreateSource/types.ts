import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createSourcePath } from './api';

export type TSourceCreateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createSourcePath, 'post'>
>;

export type TSourceCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createSourcePath, 'post'>
>;
