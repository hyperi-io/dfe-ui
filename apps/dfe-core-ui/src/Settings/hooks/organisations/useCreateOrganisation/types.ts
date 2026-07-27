import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createOrganisationPath } from './api';

export type TOrganisationCreateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof createOrganisationPath, 'post'>
>;
export type TOrganisationCreateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createOrganisationPath, 'post'>
>;
