import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSourceCataloguePath } from './api';

export type TSourceCatalogueResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSourceCataloguePath, 'get'>
>;

export type TCatalogueEntry = TSourceCatalogueResponse['items'][number];

/** How a catalogue entry's data reaches the platform. */
export type TCatalogueIntake = 'beats' | 'receiver' | 'fetcher';

export interface UseFetchSourceCatalogueProps {
  search?: string;
  intake?: TCatalogueIntake;
  page?: number;
  per_page?: number;
}
