import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryStatePath } from './api';

export type TSetLibraryArtifactStateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof libraryStatePath, 'put'>
>;

export type TSetLibraryArtifactStateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryStatePath, 'put'>
>;
