import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchOrganisationsPath } from './api';

export type TOrganisationListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchOrganisationsPath, 'get'>
>;

export type TOrganisationListSummary = TOrganisationListResponse[number];
