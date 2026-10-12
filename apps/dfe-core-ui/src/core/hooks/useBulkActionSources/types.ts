import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { bulkActionSourcesPath } from './api';

export type TBulkActionSourcesRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof bulkActionSourcesPath, 'post'>
>;
export type TBulkActionSourcesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof bulkActionSourcesPath, 'post'>
>;
