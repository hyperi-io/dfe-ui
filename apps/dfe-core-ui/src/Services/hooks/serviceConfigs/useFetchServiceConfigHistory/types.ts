import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchServiceConfigHistoryPath } from './api';

export type TFetchServiceConfigHistoryResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchServiceConfigHistoryPath, 'get'>
>;
