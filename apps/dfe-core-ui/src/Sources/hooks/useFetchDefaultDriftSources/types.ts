import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { defaultsDriftPath } from './api';
export type TDefaultDriftSources = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof defaultsDriftPath, 'get'>
>;
