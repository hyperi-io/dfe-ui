'use client';

import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { Tabs } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';
import { HuntsTabContent } from './HuntsTabContent';
import { SampleEventsTabContent } from './SampleEventsTabContent';
import { SourceColumnsTabContent } from './SourceColumnsTabContent';
import { SourceDdlPreviewTabContent } from './SourceDdlPreviewTabContent';
import { SourceRulesTabContent } from './SourceRulesTabContent';
import { TableStatsTabContent } from './TableStatsTabContent';

const SOURCE_DETAIL_TAB_KEY_MAP = {
  configuration: 'Configuration Details',
  'sample-events': 'Sample Events',
  'table-stats': 'Table Statistics',
  columns: 'Columns',
  'ddl-preview': 'DDL Preview',
  hunts: 'Hunts',
  rules: 'Rules',
} as const;
const SOURCE_DETAIL_TAB_KEYS = Object.keys(SOURCE_DETAIL_TAB_KEY_MAP);

type SourceDetailTabKey = keyof typeof SOURCE_DETAIL_TAB_KEY_MAP;

const DEFAULT_SOURCE_DETAIL_TAB: SourceDetailTabKey = 'configuration';

const isSourceDetailTabKey = (
  value: string | null,
): value is SourceDetailTabKey =>
  value !== null &&
  (SOURCE_DETAIL_TAB_KEYS as readonly string[]).includes(value);

type ViewSourceDetailTabsProps = SourceDetail & {
  selectedSourceName: string;
};

export const ViewSourceDetailTabs = ({
  selectedSourceName,
  ...sourceDetailData
}: ViewSourceDetailTabsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return isSourceDetailTabKey(tab) ? tab : DEFAULT_SOURCE_DETAIL_TAB;
  }, [searchParams]);

  const handleTabChange = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === DEFAULT_SOURCE_DETAIL_TAB) {
        params.delete('tab');
      } else if (isSourceDetailTabKey(key)) {
        params.set('tab', key);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const isMetaSchemaDefined =
    !!sourceDetailData.schema?.meta_schema ||
    !!sourceDetailData.schema?.derived_schema;

  return (
    <Tabs
      className="min-h-0 flex-1 -mt-3"
      activeKey={activeTab}
      onChange={handleTabChange}
      items={[
        {
          key: 'configuration',
          label: SOURCE_DETAIL_TAB_KEY_MAP['configuration'],
          children: <ConfigurationDetailsTabContent {...sourceDetailData} />,
        },

        {
          key: 'sample-events',
          label: SOURCE_DETAIL_TAB_KEY_MAP['sample-events'],
          children: (
            <SampleEventsTabContent
              source_name={selectedSourceName}
              schema={sourceDetailData.schema}
            />
          ),
        },

        /* Progressive disclosure - the next tab Items are hidden until meta/derived schema is defined */
        ...(isMetaSchemaDefined
          ? [
              {
                key: 'table-stats',
                label: SOURCE_DETAIL_TAB_KEY_MAP['table-stats'],
                children: <TableStatsTabContent />,
              },
              {
                key: 'columns',
                label: SOURCE_DETAIL_TAB_KEY_MAP['columns'],
                children: (
                  <SourceColumnsTabContent source_name={selectedSourceName} />
                ),
              },
              {
                key: 'ddl-preview',
                label: SOURCE_DETAIL_TAB_KEY_MAP['ddl-preview'],
                children: (
                  <SourceDdlPreviewTabContent
                    source_name={selectedSourceName}
                  />
                ),
              },
              {
                key: 'hunts',
                label: SOURCE_DETAIL_TAB_KEY_MAP['hunts'],
                children: <HuntsTabContent />,
              },
              {
                key: 'rules',
                label: SOURCE_DETAIL_TAB_KEY_MAP['rules'],
                children: <SourceRulesTabContent />,
              },
            ]
          : []),
      ]}
    />
  );
};
