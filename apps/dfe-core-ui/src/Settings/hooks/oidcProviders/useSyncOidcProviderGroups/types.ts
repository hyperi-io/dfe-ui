import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateOidcProviderGroupsPath } from './api';

export type TSyncOidcProviderGroupsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateOidcProviderGroupsPath, 'post'>
>;
