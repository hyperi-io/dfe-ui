import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { helmFileVariablesPath } from './api';

export type THelmFileVariablesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof helmFileVariablesPath, 'get'>
>;
