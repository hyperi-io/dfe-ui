import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appScalingPath } from './api';

export type TAppScalingResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appScalingPath, 'get'>
>;
