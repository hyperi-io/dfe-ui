import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { sourceVersionPath } from './api';
export type TSourceVersionDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceVersionPath, 'get'>
>;
