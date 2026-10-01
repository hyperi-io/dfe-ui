import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemDefaultsPath } from './api';

export type TSystemDefaultsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemDefaultsPath, 'get'>
>;
