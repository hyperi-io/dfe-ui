import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { lifecyclePath } from './api';

export type TLifecycleResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof lifecyclePath, 'get'>
>;
