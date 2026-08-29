import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryTagPath } from './api';

export type TSetLibraryTagRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof libraryTagPath, 'put'>
>;

export type TSetLibraryTagResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryTagPath, 'put'>
>;
