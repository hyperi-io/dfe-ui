import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateOrganisationPath } from './api';

export type TOrganisationUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateOrganisationPath, 'put'>
>;
export type TOrganisationUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateOrganisationPath, 'put'>
>;
