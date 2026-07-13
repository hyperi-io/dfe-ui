import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sampleRowsPath } from './api';

export type TSampleRowsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sampleRowsPath, 'get'>
>;
