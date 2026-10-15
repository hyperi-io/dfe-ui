import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sourceCataloguesPath } from './api';

export type TSourceCataloguesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceCataloguesPath, 'get'>
>;

export type TSourceCatalogueItem = TSourceCataloguesResponse['items'][number];

export type TSourceCatalogueIntake =
  TSourceCataloguesResponse['items'][number]['intakes'][number];

export interface UseFetchInfiniteSourceCataloguesProps {
  search?: string;
  intake?: string;
  per_page?: number;
}
