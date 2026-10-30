import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sourceCataloguesPath } from './api';

export type TSourceCataloguesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceCataloguesPath, 'get'>
>;

export type TSourceCatalogueItem = TSourceCataloguesResponse['items'][number];

/** The intakes the engine knows: an entry's `intakes` are plain strings, its default is this enum. */
export type TSourceCatalogueIntake = TSourceCatalogueItem['default_intake'];

export interface UseFetchInfiniteSourceCataloguesProps {
  search?: string;
  intake?: TSourceCatalogueIntake;
  tags?: string[];
  /** Only entries whose transform engine is this one, matched without regard to case. */
  engine?: string;
  /** List entries already stored as a source too. */
  include_stored?: boolean;
  per_page?: number;
  page?: number;
}
