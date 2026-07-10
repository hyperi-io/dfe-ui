import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchGroupsPath } from './api';

export type TGroupsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchGroupsPath, 'get'>
>;

export type TGroupsItemSummary = TGroupsResponse[number];
