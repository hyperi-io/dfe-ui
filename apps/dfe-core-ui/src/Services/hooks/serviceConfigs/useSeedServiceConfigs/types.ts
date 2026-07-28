import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { seedServiceConfigsPath } from './api';

export type TSeedServiceConfigsRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof seedServiceConfigsPath, 'post'> & {
    service: string;
    instance: string;
  }
>;
export type TSeedServiceConfigsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof seedServiceConfigsPath, 'post'>
>;
