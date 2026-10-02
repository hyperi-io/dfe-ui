import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemDefaultsPath } from './api';

export type TUpdateSystemDefaultsRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof systemDefaultsPath, 'patch'>
>;

export type TUpdateSystemDefaultsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemDefaultsPath, 'patch'>
>;
