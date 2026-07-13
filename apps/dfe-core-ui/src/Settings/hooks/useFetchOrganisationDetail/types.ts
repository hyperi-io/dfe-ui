import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchOrganisationDetailPath } from './api';

export type TOrganisationDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchOrganisationDetailPath, 'get'>
>;
