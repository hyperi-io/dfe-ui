'use client';

import { RbacProtected } from '@/core/components/RbacProtected';
import { IconStack2, IconUsersGroup } from '@repo/dfe-icons';
import { NavigationLink } from './NavigationLink';
import { UserDetailsCard } from './UserDetailsCard';

const { rbacActions } = RbacProtected;

export const SettingsActionPopoverContent = () => {
  return (
    <div className="flex min-w-48 flex-col">
      <UserDetailsCard />

      <div className="flex flex-col gap-2 mt-4">
        <RbacProtected
          action={[
            rbacActions.lifecycle_read,
            rbacActions.config_write,
            rbacActions.helmvars_read,
            rbacActions.helmvars_write,
            rbacActions.governance_read,
            rbacActions.governance_write,
          ]}
        >
          <RbacProtected.Unrestricted>
            <NavigationLink
              link="/settings/platform"
              icon={<IconStack2 />}
              label="Platform Settings"
            />
          </RbacProtected.Unrestricted>
        </RbacProtected>

        <RbacProtected
          action={[
            rbacActions.org_read,
            rbacActions.org_write,
            rbacActions.org_delete,
            rbacActions.account_read,
            rbacActions.account_write,
            rbacActions.account_delete,
            rbacActions.role_read,
            rbacActions.role_write,
            rbacActions.role_delete,
            rbacActions.group_read,
            rbacActions.group_write,
            rbacActions.group_delete,
            rbacActions.oidc_read,
            rbacActions.oidc_write,
            rbacActions.oidc_delete,
            rbacActions.api_key_read,
            rbacActions.api_key_write,
            rbacActions.api_key_delete,
          ]}
        >
          <RbacProtected.Unrestricted>
            <NavigationLink
              link="/settings/admin"
              icon={<IconUsersGroup />}
              label="Admin Settings"
            />
          </RbacProtected.Unrestricted>
        </RbacProtected>
      </div>
    </div>
  );
};
