import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchPermissionsPath } from './api';

export type TFetchPermissionsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchPermissionsPath, 'get'>
>;
