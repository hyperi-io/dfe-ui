import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryVersionPath } from './api';

export type TLibraryVersionDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryVersionPath, 'get'>
>;
