import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { applyDeploymentSizePath } from './api';

export type TApplyDeploymentSizeRequestBody = {
  service: string;
  instance: string;
  size: string;
};
export type TApplyDeploymentSizeResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof applyDeploymentSizePath, 'post'>
>;
