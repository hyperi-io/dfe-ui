import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appRoutingSyncPath } from './api';

export type TSyncAppRoutingResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appRoutingSyncPath, 'post'>
>;
