import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchYourOrganisationPath } from './api';

export type TYourOrganisation = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchYourOrganisationPath, 'get'>
>;
