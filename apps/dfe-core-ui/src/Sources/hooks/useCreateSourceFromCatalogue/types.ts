import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createSourceFromCataloguePath } from './api';

export type TCatalogueSourceRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createSourceFromCataloguePath, 'post'>
>;

export type TCatalogueSourceResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createSourceFromCataloguePath, 'post'>
>;

export interface CreateSourceFromCatalogueRequest {
  entry: string;
  body: TCatalogueSourceRequestBody;
}
