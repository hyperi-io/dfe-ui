import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryUsagePath } from './api';

export type TLibraryUsageResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryUsagePath, 'get'>
>;

export type TLibraryUsage = TLibraryUsageResponse[number];
