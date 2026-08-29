import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { deleteLibraryArtifactPath } from './api';

export type TDeleteLibraryArtifactResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deleteLibraryArtifactPath, 'delete'>
>;
