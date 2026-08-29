import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFileLinkPath } from './api';

export type TLinkAppFileRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof appFileLinkPath, 'post'>
>;

export type TLinkAppFileResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFileLinkPath, 'post'>
>;
