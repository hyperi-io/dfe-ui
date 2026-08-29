import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appPath } from './api';

export type TAppDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appPath, 'get'>
>;
