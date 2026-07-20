'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { NavigationTabLabel } from '@/core/components/NavigationTabLabel';
import { GitOps } from '@/Platform/components/GitOps';
import { Governance } from '@/Platform/components/Governance';
import { SystemManagement } from '@/Platform/components/SystemManagement';
import { Tabs } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  isPlatformTabKey,
  PLATFORM_TAB_DETAILS,
  platformTabFromPathname,
  platformTabPath,
} from './platformTabs';

export const PlatformScene = () => {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(
    () => platformTabFromPathname(pathname),
    [pathname],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      if (!isPlatformTabKey(key)) {
        return;
      }
      router.replace(platformTabPath(key));
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
            key: PLATFORM_TAB_DETAILS.system.key,
            label: (
              <NavigationTabLabel
                label={PLATFORM_TAB_DETAILS.system.label}
                description={PLATFORM_TAB_DETAILS.system.description}
              />
            ),
            children: <SystemManagement />,
          },
          {
            key: PLATFORM_TAB_DETAILS.gitops.key,
            label: (
              <NavigationTabLabel
                label={PLATFORM_TAB_DETAILS.gitops.label}
                description={PLATFORM_TAB_DETAILS.gitops.description}
              />
            ),
            children: <GitOps />,
          },
          {
            key: PLATFORM_TAB_DETAILS.governance.key,
            label: (
              <NavigationTabLabel
                label={PLATFORM_TAB_DETAILS.governance.label}
                description={PLATFORM_TAB_DETAILS.governance.description}
              />
            ),
            children: <Governance />,
          },
        ]}
      />
    </MainContentCard>
  );
};
