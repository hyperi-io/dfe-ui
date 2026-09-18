import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemSettingsPath } from './api';

export type TSystemSettingsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemSettingsPath, 'get'>
>;
