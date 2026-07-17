import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { helmFileVariablePath } from './api';

export type THelmFileVariableRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof helmFileVariablePath, 'put'>
>;

export type TUpdateHelmFileVariableResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof helmFileVariablePath, 'put'>
>;
