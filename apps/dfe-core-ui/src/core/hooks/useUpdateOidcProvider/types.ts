import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateOidcProviderPath } from './api';

export type TOidcProviderUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateOidcProviderPath, 'put'>
>;
export type TOidcProviderUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateOidcProviderPath, 'put'>
>;
