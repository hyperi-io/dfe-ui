import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSetupStatusPath } from './api';

export type TFetchSetupStatusResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSetupStatusPath, 'get'>
>;
