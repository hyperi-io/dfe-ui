import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFilePath } from './api';

export type TAppFileDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFilePath, 'get'>
>;
