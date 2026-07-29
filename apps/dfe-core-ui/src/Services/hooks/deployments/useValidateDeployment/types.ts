import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { validateDeploymentPath } from './api';

export type TValidateDeploymentRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof validateDeploymentPath, 'post'> & {
    service: string;
    instance: string;
  }
>;
export type TValidateDeploymentResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof validateDeploymentPath, 'post'>
>;
