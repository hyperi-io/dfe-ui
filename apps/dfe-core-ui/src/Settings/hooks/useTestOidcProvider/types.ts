import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { testOidcProviderPath } from './api';

export type TTestOidcProviderResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof testOidcProviderPath, 'get'>
>;
