'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { NavigationTabLabel } from '@/core/components/NavigationTabLabel';
import { AccountManagement } from '@/Settings/components/AccountManagement';
import { ApiKeyManagement } from '@/Settings/components/ApiKeyManagement';
import { GroupManagement } from '@/Settings/components/GroupManagement';
import { OidcProviderManagement } from '@/Settings/components/OidcProviderManagement';
import { OrganisationManagement } from '@/Settings/components/OrganisationManagement';
import { RoleManagement } from '@/Settings/components/RoleManagement';
import { Tabs } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  ADMIN_TAB_DETAILS,
  adminTabFromPathname,
  adminTabPath,
  isAdminTabKey,
} from './adminTabs';

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
          header:
            'w-full max-w-68 shrink-0 h-full max-h-[calc(100vh-100px)] css-custom-scrollbar',
          content: 'min-w-0 flex-1 pl-6',
        }}
        items={[
          {
            key: ADMIN_TAB_DETAILS['organisation-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['organisation-management'].label}
                description={
                  ADMIN_TAB_DETAILS['organisation-management'].description
                }
              />
            ),
            children: <OrganisationManagement />,
          },
          {
            key: ADMIN_TAB_DETAILS['role-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['role-management'].label}
                description={ADMIN_TAB_DETAILS['role-management'].description}
              />
            ),
            children: <RoleManagement />,
          },
          {
            key: ADMIN_TAB_DETAILS['group-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['group-management'].label}
                description={ADMIN_TAB_DETAILS['group-management'].description}
              />
            ),
            children: <GroupManagement />,
          },
          {
            key: ADMIN_TAB_DETAILS['account-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['account-management'].label}
                description={
                  ADMIN_TAB_DETAILS['account-management'].description
                }
              />
            ),
            children: <AccountManagement />,
          },
          {
            key: ADMIN_TAB_DETAILS['oidc-provider-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['oidc-provider-management'].label}
                description={
                  ADMIN_TAB_DETAILS['oidc-provider-management'].description
                }
              />
            ),
            children: <OidcProviderManagement />,
          },
          {
            key: ADMIN_TAB_DETAILS['api-key-management'].key,
            label: (
              <NavigationTabLabel
                label={ADMIN_TAB_DETAILS['api-key-management'].label}
                description={
                  ADMIN_TAB_DETAILS['api-key-management'].description
                }
              />
            ),
            children: <ApiKeyManagement />,
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
