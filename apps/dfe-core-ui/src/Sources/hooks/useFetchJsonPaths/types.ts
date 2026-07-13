import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { jsonPathsPath } from './api';

export type TJsonPathsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof jsonPathsPath, 'get'>
>;
