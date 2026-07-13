import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { sourcePath } from './api';

export type TSourcePatchRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof sourcePath, 'patch'>
> & {
  name: string;
  enabled: boolean;
};

export type TSourcePatchResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof sourcePath, 'patch'>
>;
