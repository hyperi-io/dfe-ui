import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import {
  systemStartClickhouseCloudPath,
  systemStopClickhouseCloudPath,
} from './api';

export type TSystemStartStopClickhouseCloudResponse =
  DfeClientSuccessResponseBody<
    | DfeClientOperationFor<typeof systemStopClickhouseCloudPath, 'post'>
    | DfeClientOperationFor<typeof systemStartClickhouseCloudPath, 'post'>
  >;
