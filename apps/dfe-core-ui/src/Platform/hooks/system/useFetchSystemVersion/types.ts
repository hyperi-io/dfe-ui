import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemVersionPath } from './api';

export type TSystemVersionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemVersionPath, 'get'>
>;
