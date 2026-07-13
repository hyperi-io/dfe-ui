import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { buildSourcePath } from './api';

export type TSourceBuildResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof buildSourcePath, 'post'>
>;
