import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFileCopyPath } from './api';

export type TCopyAppFilesRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof appFileCopyPath, 'post'>
>;

export type TCopyAppFilesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFileCopyPath, 'post'>
>;
