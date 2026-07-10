import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { components } from '@repo/dfe-engine-types';
import { promoteFieldsPath } from './api';

export type TPromoteFieldRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof promoteFieldsPath, 'post'>
> & {
  dry_run?: boolean;
};
export type TPromoteFieldResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof promoteFieldsPath, 'post'>
> &
  components['schemas']['PromoteFieldResponse'];
