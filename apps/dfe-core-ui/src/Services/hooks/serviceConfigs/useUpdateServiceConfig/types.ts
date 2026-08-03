import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateServiceConfigPath } from './api';

export type TServiceConfigUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateServiceConfigPath, 'put'>
> & {
  serviceName: string;
  instanceName: string;
};
export type TServiceConfigUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateServiceConfigPath, 'put'>
>;
