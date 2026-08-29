import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { deleteLibraryTagPath } from './api';

export type TDeleteLibraryTagResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deleteLibraryTagPath, 'delete'>
>;
