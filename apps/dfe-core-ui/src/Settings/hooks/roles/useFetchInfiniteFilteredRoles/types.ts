import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchInfiniteFilteredRolesPath } from './api';

export type TRoleListResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchInfiniteFilteredRolesPath, 'get'>
>;

export type TRoleListItem = TRoleListResponse['items'][number];

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

export interface UseFetchInfiniteFilteredRolesProps {
  search?: string;
  resource_type?: ResourceType;
  per_page?: number;
}
