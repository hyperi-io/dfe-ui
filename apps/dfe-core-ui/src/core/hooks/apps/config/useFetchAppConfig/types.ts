import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appConfigPath } from './api';

export type TAppConfigResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appConfigPath, 'get'>
>;

export type TAppConfigField = NonNullable<TAppConfigResponse['fields']>[number];

export type TAppCustomEnv = NonNullable<TAppConfigResponse['custom']>[number];

export type TAppUnknownField = NonNullable<
  TAppConfigResponse['unknown']
>[number];
