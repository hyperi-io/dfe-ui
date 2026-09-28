import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateAlertPath } from './api';

/** `url_scheme` is read-only: the engine derives it from the URL. */
export type TAlertUpdateRequest = Omit<
  DfeClientRequestBody<DfeClientOperationFor<typeof updateAlertPath, 'put'>>,
  'url_scheme'
>;

export type TAlertUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateAlertPath, 'put'>
>;
