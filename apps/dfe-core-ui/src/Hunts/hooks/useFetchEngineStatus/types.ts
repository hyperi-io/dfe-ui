import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchEngineStatusPath } from './api';

export type THuntEngineStatus = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchEngineStatusPath, 'get'>
>;
