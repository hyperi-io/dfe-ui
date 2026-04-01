'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { FeatureFlag, On } from '@/core/components/FeatureFlag';
import { FeatureFlags } from '@/core/components/FeatureFlag/featureFlag.constants';
import { AdminTabLabel } from '@/Settings/components/AdminTabLabel';
import { GroupManagement } from '@/Settings/components/GroupManagement';
import { OrganisationManagement } from '@/Settings/components/OrganisationManagement';
import { RoleManagement } from '@/Settings/components/RoleManagement';
import { UserManagement } from '@/Settings/components/UserManagement';
import { IconAlertCircle } from '@repo/dfe-icons';
import { Tabs } from 'antd';

export const AdminControlsScene = () => {
  return (
    <>
      <FeatureFlag feature={FeatureFlags.DevAlerts}>
        <On>
          <div className="bg-background">
            <p className="text-sm flex items-center gap-2 bg-error/10 border border-error text-error p-2 rounded-md m-2">
              <IconAlertCircle />
              All data on this page is mocked.
            </p>
          </div>
        </On>
      </FeatureFlag>

      <MainContentCard className="pl-0">
        <Tabs
          className="h-full"
          tabPlacement="start"
          items={[
            {
              key: 'organization-management',
              label: (
                <AdminTabLabel
                  label="Organisation Management"
                  description="Add and remove organisations, manage organisation specific configurations and defaults."
                />
              ),
              children: <OrganisationManagement />,
            },
            {
              key: 'role-management',
              label: (
                <AdminTabLabel
                  label="Role Management"
                  description="Manage roles and their permissions, configure custom roles and permissions."
                />
              ),
              children: <RoleManagement />,
            },
            {
              key: 'group-management',
              label: (
                <AdminTabLabel
                  label="Group Management"
                  description="Manage groups and their members, configure custom groups and members."
                />
              ),
              children: <GroupManagement />,
            },
            {
              key: 'user-management',
              label: (
                <AdminTabLabel
                  label="User Management"
                  description="Manage users, link LDAP users and configure user account default settings."
                />
              ),
              children: <UserManagement />,
            },
          ]}
        />
      </MainContentCard>
    </>
  );
};
