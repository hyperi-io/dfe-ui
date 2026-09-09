import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { sourceFlowPath } from './api';

/** One source's whole path, as the engine's resolver reports it. */
export type TSourceFlow = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourceFlowPath, 'get'>
>;

export type TSourceFlowTransform = TSourceFlow['transform'];
export type TSourceFlowOutputs = TSourceFlow['outputs'];
