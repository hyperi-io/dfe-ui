import { useAuthMe } from '@/core/hooks/useAuthMe';
import isArray from 'lodash/isArray';
import { useMemo } from 'react';
import { type UI_DISPLAY_ACTIONS_TYPE } from './rbac.constants';
import { isUserAuthorized } from './useRbac.helpers';

interface UseRbacProps {
  action: UI_DISPLAY_ACTIONS_TYPE | UI_DISPLAY_ACTIONS_TYPE[];
  /** With a list of actions, authorise only a user holding every one, not any one. */
  requireAll?: boolean;
}
// Used as a standalone hook or within the RbacProtected component to conditionally render components based on the user's permissions and groups
// Standalone hook can be used for redirects away from certain routes
export const useRbac = ({ action, requireAll = false }: UseRbacProps) => {
  const { data: { permissions = [] } = {}, isLoading, isError } = useAuthMe();

  const userPermissions = useMemo(() => new Set(permissions), [permissions]);

  const held = (a: UI_DISPLAY_ACTIONS_TYPE) =>
    isUserAuthorized(userPermissions, a);
  const isAuthorized = isArray(action)
    ? requireAll
      ? action.every(held)
      : action.some(held)
    : held(action);

  return { isAuthorized, isLoading, isError };
};
