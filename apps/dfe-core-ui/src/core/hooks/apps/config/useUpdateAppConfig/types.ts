import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { updateAppConfigPath } from './api';

export type TUpdateAppConfigRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateAppConfigPath, 'put'>
>;

export type TUpdateAppConfigResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAppConfigPath, 'put'>
>;
