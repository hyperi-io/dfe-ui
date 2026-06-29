'use client';

import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { Tabs } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';
import { SampleEventsTabContent } from './SampleEventsTabContent';
import { SourceColumnsTabContent } from './SourceColumnsTabContent';
import { SourceDdlPreviewTabContent } from './SourceDdlPreviewTabContent';
import { PromoteRowsProvider } from './contexts/PromoteRows.context';

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

type ViewSourceDetailTabsProps = SourceVersionDetail & {
  selectedSourceName: string;
  selectedSourceVersion: string;
};

export const ViewSourceDetailTabs = ({
  selectedSourceName,
  selectedSourceVersion,
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
    !!sourceDetailData.version.schema?.meta_schema ||
    !!sourceDetailData.version.schema?.derived_schema;

  return (
    <Tabs
      className={cn('flex-1 min-h-0 -mt-3 [&_.ant-tabs-content]:h-full')}
      classNames={{
        content: 'h-full',
      }}
      activeKey={activeTab}
      onChange={handleTabChange}
      items={[
        {
          key: 'configuration',
          label: SOURCE_DETAIL_TAB_KEY_MAP['configuration'],
          children: (
            <RbacProtected action={RbacProtected.rbacActions.source_read}>
              <RbacProtected.Unrestricted>
                <ConfigurationDetailsTabContent {...sourceDetailData} />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted className="h-full">
                <RbacProtected.RestrictedRoute />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },

        {
          key: 'sample-events',
          label: SOURCE_DETAIL_TAB_KEY_MAP['sample-events'],
          children: (
            <RbacProtected action={RbacProtected.rbacActions.schema_read}>
              <RbacProtected.Unrestricted>
                <PromoteRowsProvider
                  source_name={selectedSourceName}
                  version={selectedSourceVersion}
                >
                  <SampleEventsTabContent
                    source={sourceDetailData}
                    version={selectedSourceVersion}
                  />
                </PromoteRowsProvider>
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted className="h-full">
                <RbacProtected.RestrictedRoute />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },

        /* Progressive disclosure - the next tab Items are hidden until meta/derived schema is defined */
        ...(isMetaSchemaDefined
          ? [
              // {
              //   key: 'table-stats',
              //   label: SOURCE_DETAIL_TAB_KEY_MAP['table-stats'],
              //   children: <TableStatsTabContent />,
              // },
              {
                key: 'columns',
                label: SOURCE_DETAIL_TAB_KEY_MAP['columns'],
                children: (
                  <RbacProtected action={RbacProtected.rbacActions.source_read}>
                    <RbacProtected.Unrestricted>
                      <SourceColumnsTabContent
                        source_name={selectedSourceName}
                      />
                    </RbacProtected.Unrestricted>
                    <RbacProtected.Restricted className="h-full">
                      <RbacProtected.RestrictedRoute />
                    </RbacProtected.Restricted>
                  </RbacProtected>
                ),
              },
              {
                key: 'ddl-preview',
                label: SOURCE_DETAIL_TAB_KEY_MAP['ddl-preview'],
                children: (
                  <RbacProtected action={RbacProtected.rbacActions.source_read}>
                    <RbacProtected.Unrestricted>
                      <SourceDdlPreviewTabContent
                        source_name={selectedSourceName}
                        source_version={selectedSourceVersion}
                      />
                    </RbacProtected.Unrestricted>
                    <RbacProtected.Restricted className="h-full">
                      <RbacProtected.RestrictedRoute />
                    </RbacProtected.Restricted>
                  </RbacProtected>
                ),
              },
              // {
              //   key: 'rules',
              //   label: SOURCE_DETAIL_TAB_KEY_MAP['rules'],
              //   children: <SourceRulesTabContent />,
              // },
              // {
              //   key: 'hunts',
              //   label: SOURCE_DETAIL_TAB_KEY_MAP['hunts'],
              //   children: <HuntsTabContent />,
              // },
            ]
          : []),
      ]}
    />
  );
};
