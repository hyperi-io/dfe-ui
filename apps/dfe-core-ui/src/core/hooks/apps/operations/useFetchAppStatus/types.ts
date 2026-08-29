import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appStatusPath } from './api';

export type TAppStatusResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appStatusPath, 'get'>
>;
