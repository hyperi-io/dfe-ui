import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryKindsPath } from './api';

export type TLibraryKindsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryKindsPath, 'get'>
>;

export type TLibraryKind = TLibraryKindsResponse[number];
