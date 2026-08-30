import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { deleteAppPath } from './api';

export type TDeleteAppInstanceResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deleteAppPath, 'delete'>
>;
