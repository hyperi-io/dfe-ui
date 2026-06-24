'use client';

import { EmptyDetail } from '@/core/components/EmptyDetail';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { Tabs } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';

const HUNT_DETAIL_TAB_KEY_MAP = {
  configuration: 'Configuration Details',
} as const;
const HUNT_DETAIL_TAB_KEYS = Object.keys(HUNT_DETAIL_TAB_KEY_MAP);

type HuntDetailTabKey = keyof typeof HUNT_DETAIL_TAB_KEY_MAP;

const DEFAULT_HUNT_DETAIL_TAB: HuntDetailTabKey = 'configuration';

const isHuntDetailTabKey = (value: string | null): value is HuntDetailTabKey =>
  value !== null && (HUNT_DETAIL_TAB_KEYS as readonly string[]).includes(value);

type ViewHuntDetailTabsProps = HuntDetailResponse & {
  selectedHuntName: string | null;
};

export const ViewHuntDetailTabs = ({
  selectedHuntName,
  ...huntDetailData
}: ViewHuntDetailTabsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return isHuntDetailTabKey(tab) ? tab : DEFAULT_HUNT_DETAIL_TAB;
  }, [searchParams]);

  const handleTabChange = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === DEFAULT_HUNT_DETAIL_TAB) {
        params.delete('tab');
      } else if (isHuntDetailTabKey(key)) {
        params.set('tab', key);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  if (!selectedHuntName) {
    return (
      <EmptyDetail
        title="No hunt selected"
        description="Select a hunt from the list to view its configuration."
      />
    );
  }

  return (
    <Tabs
      className="flex-1 min-h-0 -mt-3"
      activeKey={activeTab}
      onChange={handleTabChange}
      items={[
        {
          key: 'configuration',
          label: HUNT_DETAIL_TAB_KEY_MAP['configuration'],
          children: <ConfigurationDetailsTabContent {...huntDetailData} />,
        },
      ]}
    />
  );
};
