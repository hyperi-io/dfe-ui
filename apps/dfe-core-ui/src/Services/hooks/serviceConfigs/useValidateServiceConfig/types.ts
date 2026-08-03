import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { validateServiceConfigPath } from './api';

export type TValidateServiceConfigRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof validateServiceConfigPath, 'post'> & {
    service: string;
    instance: string;
  }
>;
export type TValidateServiceConfigResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof validateServiceConfigPath, 'post'>
>;
