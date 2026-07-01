import { components } from '@repo/dfe-engine-types';

export type RoleUpdateRequest = components['schemas']['UpdateRoleRequest'];
export type RoleUpdateResponse = components['schemas']['RoleResponse'];

export interface UseUpdateRoleProps {
  role_name: string;
  onSuccess?: (data: RoleUpdateResponse) => void;
  onError?: (error: Error) => void;
}
