import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchHuntDetailPath } from './api';

export type THuntDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchHuntDetailPath, 'get'>
>;
