import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchAccountsPath } from './api';

export type TAccountsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchAccountsPath, 'get'>
>;

export type TAccountsItemSummary = TAccountsResponse[number];
