import {
  DfeClientOperationFor,
  DfeClientRequestBody,
} from '@/core/config/api/client.types';
import { setYourOrganisationPath } from './api';

export type TYourOrganisationUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof setYourOrganisationPath, 'put'>
>;
