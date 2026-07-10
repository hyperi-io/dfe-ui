import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { testTransformPath } from './api';

export type TTestTransformRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof testTransformPath, 'post'>
>;
export type TTestTransformResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof testTransformPath, 'post'>
>;
