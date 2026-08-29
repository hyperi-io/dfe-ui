import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryPath } from './api';

export type TLibraryArtifactsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryPath, 'get'>
>;

export type TLibraryArtifact = TLibraryArtifactsResponse[number];

/**
 * Listing filters. `label` is repeatable and ANDed across keys, so the caller
 * passes an array rather than one string.
 */
export type TLibraryArtifactFilters = {
  kind?: string;
  group?: string;
  state?: string;
  label?: string[];
  q?: string;
};
