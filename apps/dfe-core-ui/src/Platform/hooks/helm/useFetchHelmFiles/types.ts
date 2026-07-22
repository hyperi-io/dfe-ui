import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { helmFilesPath } from './api';

export type THelmFilesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof helmFilesPath, 'get'>
>;
