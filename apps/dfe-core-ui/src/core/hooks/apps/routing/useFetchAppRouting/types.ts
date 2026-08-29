import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appRoutingPath } from './api';

export type TAppRoutingResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appRoutingPath, 'get'>
>;
