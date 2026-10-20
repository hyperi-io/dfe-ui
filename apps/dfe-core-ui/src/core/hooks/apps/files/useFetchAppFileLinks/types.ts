import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appFileLinksPath } from './api';

export type TAppFileLinksResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appFileLinksPath, 'get'>
>;
