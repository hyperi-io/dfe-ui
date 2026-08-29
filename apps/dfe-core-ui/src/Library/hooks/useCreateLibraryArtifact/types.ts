import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { createLibraryArtifactPath } from './api';

export type TCreateLibraryArtifactRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createLibraryArtifactPath, 'post'>
>;

export type TCreateLibraryArtifactResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createLibraryArtifactPath, 'post'>
>;
