import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { sourceLagPath } from './api';

/** How far the customer's own transform is behind on the landing topic. */
export type TSourceLag = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceLagPath, 'get'>
>;
