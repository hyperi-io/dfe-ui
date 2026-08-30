import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFileDryRunPath } from './api';

export type TDryRunAppFileRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof appFileDryRunPath, 'post'>
>;

export type TDryRunAppFileResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFileDryRunPath, 'post'>
>;

export type TDryRunEvent = NonNullable<
  TDryRunAppFileResponse['events']
>[number];
