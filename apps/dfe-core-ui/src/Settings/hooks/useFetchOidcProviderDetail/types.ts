import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchOidcProviderDetailPath } from './api';

export type TOidcProviderDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchOidcProviderDetailPath, 'get'>
>;
