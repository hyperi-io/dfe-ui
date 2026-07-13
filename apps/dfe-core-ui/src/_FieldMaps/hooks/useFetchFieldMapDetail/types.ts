import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSourceFieldMapPath, fetchStandardFieldMapPath } from './api';

export type TFetchSourceFieldMapResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSourceFieldMapPath, 'get'>
>;
export type TFetchStandardFieldMapResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchStandardFieldMapPath, 'get'>
>;

export type TSourceFieldMapResponse =
  | TFetchSourceFieldMapResponse
  | TFetchStandardFieldMapResponse;
