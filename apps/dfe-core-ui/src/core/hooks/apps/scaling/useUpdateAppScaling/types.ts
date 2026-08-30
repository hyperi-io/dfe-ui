import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { updateAppScalingPath } from './api';

export type TUpdateAppScalingRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateAppScalingPath, 'put'>
>;

export type TUpdateAppScalingResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAppScalingPath, 'put'>
>;
