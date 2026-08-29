import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appInstancesPath } from './api';

export type TCreateAppInstanceRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof appInstancesPath, 'post'>
>;

export type TCreateAppInstanceResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appInstancesPath, 'post'>
>;
