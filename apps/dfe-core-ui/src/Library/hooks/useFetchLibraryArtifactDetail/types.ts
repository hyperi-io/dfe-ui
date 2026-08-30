import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { libraryArtifactPath } from './api';

export type TLibraryArtifactDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof libraryArtifactPath, 'get'>
>;
