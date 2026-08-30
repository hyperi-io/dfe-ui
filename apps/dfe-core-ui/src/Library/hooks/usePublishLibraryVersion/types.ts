import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { publishLibraryVersionPath } from './api';

export type TPublishLibraryVersionRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof publishLibraryVersionPath, 'post'>
>;

export type TPublishLibraryVersionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof publishLibraryVersionPath, 'post'>
>;
