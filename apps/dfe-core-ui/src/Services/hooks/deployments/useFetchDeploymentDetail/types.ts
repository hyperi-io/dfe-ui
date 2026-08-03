import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchDeploymentDetailPath } from './api';

export type TDeploymentDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchDeploymentDetailPath, 'get'>
>;
