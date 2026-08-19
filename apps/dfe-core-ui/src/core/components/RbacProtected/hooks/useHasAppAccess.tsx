import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useMemo } from 'react';
import { APP_ACCESS_ACTIONS } from './appAccess';
import { isUserAuthorized } from './useRbac.helpers';

// Whether the authenticated user holds any baseline app permission, i.e. any
// usable surface at all. Empty permissions, or a set matching none of
// APP_ACCESS_ACTIONS, resolves to hasAccess: false. Wildcards ('*', 'source:*')
// are honoured via isUserAuthorized. While loading or on error, hasAccess stays
// true so a transient fetch failure never locks a user out.
export const useHasAppAccess = () => {
  const { data: { permissions = [] } = {}, isLoading, isError } = useAuthMe();

  const hasAccess = useMemo(() => {
    if (isLoading || isError) return true;
    const userPermissions = new Set(permissions);
    return APP_ACCESS_ACTIONS.some((action) =>
      isUserAuthorized(userPermissions, action),
    );
  }, [permissions, isLoading, isError]);

  return { hasAccess, isLoading, isError };
};
