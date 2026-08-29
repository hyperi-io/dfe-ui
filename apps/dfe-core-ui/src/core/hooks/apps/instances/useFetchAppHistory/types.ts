import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appHistoryPath } from './api';

export type TAppHistoryResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appHistoryPath, 'get'>
>;

export type TAppHistoryEntry = TAppHistoryResponse[number];
