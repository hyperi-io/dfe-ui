'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { AdminTabLabel } from '@/Settings/components/AdminTabLabel';
import { GroupManagement } from '@/Settings/components/GroupManagement';
import { OrganisationManagement } from '@/Settings/components/OrganisationManagement';
import { RoleManagement } from '@/Settings/components/RoleManagement';
import { UserManagement } from '@/Settings/components/UserManagement';
import { Tabs } from 'antd';

export const AdminControlsScene = () => {
  return (
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
          // {
          //   key: 'audit',
          //   label: (
          //     <AdminTabLabel
          //       label="Audit"
          //       description="View audit logs, security events and usage metrics."
          //     />
          //   ),
          //   children: <AuditDashboard />,
          // },
        ]}
      />
    </MainContentCard>
  );
};
