import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchTableEnginesPath } from './api';

export type TTableEnginesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchTableEnginesPath, 'get'>
>;

export type TTableEngine = TTableEnginesResponse['items'][number];
