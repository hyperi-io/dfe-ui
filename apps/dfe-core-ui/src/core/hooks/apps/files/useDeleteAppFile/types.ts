import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { deleteAppFilePath } from './api';

export type TDeleteAppFileResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deleteAppFilePath, 'delete'>
>;
