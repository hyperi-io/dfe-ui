import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createOidcProviderPath } from './api';

export type TCreateOidcProviderRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createOidcProviderPath, 'post'>
>;

export type TCreateOidcProviderResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createOidcProviderPath, 'post'>
>;
