import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemDeploymentPath } from './api';

export type TSystemDeploymentResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemDeploymentPath, 'get'>
>;
