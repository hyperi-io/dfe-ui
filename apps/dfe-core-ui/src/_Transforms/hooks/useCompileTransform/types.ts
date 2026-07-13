import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { compileTransformPath } from './api';

export type TCompileTransformRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof compileTransformPath, 'post'>
>;
export type TCompileTransformResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof compileTransformPath, 'post'>
>;
