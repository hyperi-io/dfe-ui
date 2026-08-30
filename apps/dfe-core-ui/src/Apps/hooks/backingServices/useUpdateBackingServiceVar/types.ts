import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { backingServiceVarPath } from './api';

export type TUpdateBackingServiceVarRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof backingServiceVarPath, 'put'>
>;

export type TUpdateBackingServiceVarResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof backingServiceVarPath, 'put'>
>;
