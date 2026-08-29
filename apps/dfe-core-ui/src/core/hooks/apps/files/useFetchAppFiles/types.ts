import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFilesPath } from './api';

export type TAppFilesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFilesPath, 'get'>
>;

export type TAppFileSummary = TAppFilesResponse[number];
