import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFileRelinkPath } from './api';

export type TRelinkAppFilesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFileRelinkPath, 'post'>
>;
