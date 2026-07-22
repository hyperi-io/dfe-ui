import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { clientConfigPath } from './api';

export type TClientConfigResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof clientConfigPath, 'get'>
>;
