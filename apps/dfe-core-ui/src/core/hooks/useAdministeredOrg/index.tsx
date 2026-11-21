import { isUserAuthorized } from '@/core/components/RbacProtected/hooks/useRbac.helpers';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { scopes } from '@repo/dfe-engine-types/scopes';
import { useMemo } from 'react';

/** The role an org admin holds, bound only at its org's scope. */
export const ORG_ADMIN_ROLE = 'org_admin';

/**
 * The org an org admin administers: its accounts and identity providers only.
 * Undefined for a caller who reads every org, or one holding no org admin role.
 */
export const useAdministeredOrg = (): string | undefined => {
  const { data } = useAuthMe();

  return useMemo(() => {
    if (!data?.roles.includes(ORG_ADMIN_ROLE)) {
      return undefined;
    }
    const permissions = new Set(data.permissions ?? []);
    return isUserAuthorized(permissions, scopes.org_read)
      ? undefined
      : data.org_id || undefined;
  }, [data]);
};
