import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { triggerHuntPath } from './api';

export type TTriggerResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof triggerHuntPath, 'post'>
>;
export type TTriggerRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof triggerHuntPath, 'post'>
>;
