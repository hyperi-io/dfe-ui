import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchDeploymentHistoryPath } from './api';

export type TFetchDeploymentHistoryResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchDeploymentHistoryPath, 'get'>
>;
