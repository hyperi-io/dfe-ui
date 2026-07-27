import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchAccountDetailPath } from './api';

export type TAccountDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchAccountDetailPath, 'get'>
>;
