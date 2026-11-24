import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { checkCelPath } from './api';

export type TCheckCelRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof checkCelPath, 'post'>
>;
export type TCheckCelResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof checkCelPath, 'post'>
>;
