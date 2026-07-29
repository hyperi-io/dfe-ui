import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { seedDeploymentsPath } from './api';

export type TSeedDeploymentsRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof seedDeploymentsPath, 'post'> & {
    service: string;
    instance: string;
  }
>;
export type TSeedDeploymentsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof seedDeploymentsPath, 'post'>
>;
