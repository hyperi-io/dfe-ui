'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { AccountManagement } from '@/Settings/components/AccountManagement';
import { AdminTabLabel } from '@/Settings/components/AdminTabLabel';
import { GroupManagement } from '@/Settings/components/GroupManagement';
import { OidcProviderManagement } from '@/Settings/components/OidcProviderManagement';
import { OrganisationManagement } from '@/Settings/components/OrganisationManagement';
import { RoleManagement } from '@/Settings/components/RoleManagement';
import { Tabs } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { adminTabFromPathname, adminTabPath, isAdminTabKey } from './adminTabs';

export const AdminControlsScene = () => {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => adminTabFromPathname(pathname), [pathname]);

  const handleTabChange = useCallback(
    (key: string) => {
      if (!isAdminTabKey(key)) {
        return;
      }
      router.replace(adminTabPath(key));
    },
    [router],
  );

  return (
    <MainContentCard className="pl-0">
      <Tabs
        className="h-full min-h-0"
        tabPlacement="start"
        activeKey={activeTab}
        onChange={handleTabChange}
        classNames={{
          root: 'min-h-0',
          header: 'w-full max-w-68 shrink-0',
          content: 'min-w-0 flex-1 pl-6',
        }}
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
            key: 'account-management',
            label: (
              <AdminTabLabel
                label="Account Management"
                description="Manage accounts, link LDAP accounts and configure account default settings."
              />
            ),
            children: <AccountManagement />,
          },
          {
            key: 'oidc-provider-management',
            label: (
              <AdminTabLabel
                label="OIDC Provider Management"
                description="Add and remove OIDC providers, manage OIDC provider specific configurations and defaults."
              />
            ),
            children: <OidcProviderManagement />,
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
