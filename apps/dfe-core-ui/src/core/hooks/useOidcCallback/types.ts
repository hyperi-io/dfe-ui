import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { oidcCallbackPath } from './api';

export type TOidcCallbackResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof oidcCallbackPath, 'get'>
>;
