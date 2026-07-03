import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { components } from '@repo/dfe-engine-types';

export type RoleListResponse =
  components['schemas']['PaginatedResponse_RoleResponse_'];
export type RoleListItem = RoleListResponse['items'][number];

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

export interface UseFetchInfiniteFilteredRolesProps {
  search?: string;
  resource_type?: ResourceType;
  per_page?: number;
}
