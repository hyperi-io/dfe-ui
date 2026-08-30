import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { patchLibraryArtifactPath } from './api';

export type TPatchLibraryArtifactRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof patchLibraryArtifactPath, 'patch'>
>;

export type TPatchLibraryArtifactResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof patchLibraryArtifactPath, 'patch'>
>;
