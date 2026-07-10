import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchGroupDetailPath } from './api';

export type TGroupDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchGroupDetailPath, 'get'>
>;
