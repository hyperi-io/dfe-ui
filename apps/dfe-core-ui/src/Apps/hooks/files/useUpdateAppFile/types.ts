import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { updateAppFilePath } from './api';

export type TUpdateAppFileRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateAppFilePath, 'put'>
>;

export type TUpdateAppFileResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAppFilePath, 'put'>
>;
