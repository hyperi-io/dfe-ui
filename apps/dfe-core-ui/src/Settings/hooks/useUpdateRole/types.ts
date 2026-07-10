import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateRolePath } from './api';

export type TRoleUpdateRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateRolePath, 'put'>
>;
export type TRoleUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateRolePath, 'put'>
>;

export interface UseUpdateRoleProps {
  role_name: string;
  onSuccess?: (data: TRoleUpdateResponse) => void;
  onError?: (error: Error) => void;
}
