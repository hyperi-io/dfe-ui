import { components } from '@repo/dfe-engine-types';

export type RoleScopesResponse = components['schemas']['CasbinScopesResponse'];

export interface UseFetchInfiniteFilteredRoleScopesProps {
  search?: string;
  per_page?: number;
}
