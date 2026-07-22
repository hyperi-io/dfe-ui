import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { ACTION_MAP } from '.';
import { lifecyclePath } from './api';

export type TLifecycleRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof lifecyclePath, 'post'>
>;

export type TUpdateLifecycleResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof lifecyclePath, 'post'>
>;

export type TActionTypeOption = keyof typeof ACTION_MAP;
export type TActionTypeRequest = 'running' | 'paused' | 'stopped';
export type TActionTypeRequestBody = {
  name: string;
  action: TActionTypeOption;
};
