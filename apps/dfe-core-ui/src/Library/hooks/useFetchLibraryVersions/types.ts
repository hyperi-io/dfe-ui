import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryVersionsPath } from './api';

export type TLibraryVersionsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryVersionsPath, 'get'>
>;

export type TLibraryVersionSummary = TLibraryVersionsResponse[number];
