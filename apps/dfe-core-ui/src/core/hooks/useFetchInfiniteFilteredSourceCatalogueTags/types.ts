import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchCatalogueTagsPath } from './api';

export type TInfiniteFilteredSourceCatalogueTagsResponse =
  DfeClientSuccessResponseBody<
    DfeClientOperationFor<typeof fetchCatalogueTagsPath, 'get'>
  >;

interface TInfiniteFilteredSourceCatalogueTagsRequestParams {
  name?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredSourceCatalogueTagsProps =
  TInfiniteFilteredSourceCatalogueTagsRequestParams;
