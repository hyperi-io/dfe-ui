import { components } from '@repo/dfe-engine-types';

export type RoleListResponse =
  components['schemas']['PaginatedResponse_RoleResponse_'];
export type RoleListItem = RoleListResponse['items'][number];

export type ResourceType = 'core' | 'custom';

export interface UseFetchInfiniteFilteredRolesProps {
  search?: string;
  resource_type?: ResourceType;
  per_page?: number;
}
