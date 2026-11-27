import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchHuntExecutionsPath } from './api';

export type THuntExecutionsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchHuntExecutionsPath, 'get'>
>;
