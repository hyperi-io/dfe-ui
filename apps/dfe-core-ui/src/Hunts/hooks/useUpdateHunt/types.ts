import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateHuntPath } from './api';

export type THuntUpdateBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateHuntPath, 'put'>
>;
/** The spec requires `enabled` for its default, yet a PUT that omits it leaves the hunt as it is. */
export type THuntUpdateRequest = Omit<THuntUpdateBody, 'enabled'> & {
  enabled?: THuntUpdateBody['enabled'];
};
export type THuntUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateHuntPath, 'put'>
>;
