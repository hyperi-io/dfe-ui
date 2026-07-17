import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemClickhouseStatusPath } from './api';

export type TSystemClickhouseStatusResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemClickhouseStatusPath, 'get'>
>;
