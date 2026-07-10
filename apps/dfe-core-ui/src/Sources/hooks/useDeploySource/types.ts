import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { deploySourcePath } from './api';

export type TSourceDeployResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof deploySourcePath, 'post'>
>;

export interface SourceDeployRequest {
  name: string;
  version: string;
}
