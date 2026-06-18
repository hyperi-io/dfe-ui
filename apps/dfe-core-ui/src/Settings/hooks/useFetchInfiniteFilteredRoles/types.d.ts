import { components } from '@repo/dfe-engine-types';

export type RoleListResponse =
  components['schemas']['PaginatedResponse_RoleResponse_'];
export type RoleListItem = RoleListResponse['items'][number];

export type ResourceType = components['schemas']['ResourceType'];

export interface UseFetchInfiniteFilteredRolesProps {
  search?: string;
  resource_type?: ResourceType;
  per_page?: number;
}
