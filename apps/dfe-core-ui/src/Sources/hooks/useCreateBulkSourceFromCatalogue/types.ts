import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createBulkSourceFromCataloguePath } from './api';

export type TCatalogueBulkSourceRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createBulkSourceFromCataloguePath, 'post'>
>;

export type TCatalogueBulkSourceResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createBulkSourceFromCataloguePath, 'post'>
>;
