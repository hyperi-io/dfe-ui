import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryRollbackPath } from './api';

export type TRollbackLibraryArtifactRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof libraryRollbackPath, 'post'>
>;

export type TRollbackLibraryArtifactResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryRollbackPath, 'post'>
>;
