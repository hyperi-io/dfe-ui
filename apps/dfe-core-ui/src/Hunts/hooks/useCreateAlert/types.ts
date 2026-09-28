import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createAlertPath } from './api';

/** `url_scheme` is read-only: the engine derives it from the URL. */
export type TAlertCreateRequest = Omit<
  DfeClientRequestBody<DfeClientOperationFor<typeof createAlertPath, 'post'>>,
  'url_scheme'
>;

export type TAlertCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createAlertPath, 'post'>
>;
