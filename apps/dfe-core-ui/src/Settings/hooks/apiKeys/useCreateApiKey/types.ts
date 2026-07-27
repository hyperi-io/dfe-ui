import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createApiKeyPath } from './api';

export type TApiKeyCreateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createApiKeyPath, 'post'>
>;
export type TApiKeyCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createApiKeyPath, 'post'>
>;
