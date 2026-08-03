import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateDeploymentPath } from './api';

export type TDeploymentUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateDeploymentPath, 'put'>
> & {
  serviceName: string;
  instanceName: string;
};
export type TDeploymentUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateDeploymentPath, 'put'>
>;
