'use client';

import { SourceTransformSelector } from '@/Sources/components/SourceTransformSelector';
import { SourceFlowTabContent } from '@/Sources/components/ViewSourceTabs/SourceFlowTabContent';
import { SourceProcessingTabContent } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { Tabs } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';
import { SampleEventsTabContent } from './SampleEventsTabContent';
import { SourceBuildDeployTabContent } from './SourceBuildDeployTabContent';
import { SourceColumnsTabContent } from './SourceColumnsTabContent';
import { PromoteRowsProvider } from './contexts/PromoteRows.context';

const SOURCE_DETAIL_TAB_KEY_MAP = {
  flow: 'Flow',
  configuration: 'Configuration Details',
  'sample-events': 'Sample Events',
  processing: 'Processing',
  'table-stats': 'Table Statistics',
  columns: 'Columns',
  buildDeploy: 'Build & Deploy',
  hunts: 'Hunts',
  rules: 'Rules',
} as const;
const SOURCE_DETAIL_TAB_KEYS = Object.keys(SOURCE_DETAIL_TAB_KEY_MAP);

type SourceDetailTabKey = keyof typeof SOURCE_DETAIL_TAB_KEY_MAP;

// The flow answers "where do this source's records go", which is the question
// the rest of the tabs are details of.
const DEFAULT_SOURCE_DETAIL_TAB: SourceDetailTabKey = 'flow';

const isSourceDetailTabKey = (
  value: string | null,
): value is SourceDetailTabKey =>
  value !== null &&
  (SOURCE_DETAIL_TAB_KEYS as readonly string[]).includes(value);

type ViewSourceDetailTabsProps = TSourceVersionDetail & {
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

  const { isMetaSchemaDefined, isDeployed } = useSourceDetailsContext();
  const { setSelectedSource, refetch: refetchSources } =
    useListSourcesContext();

  const isMainSource = selectedSourceName === 'main';

  // Same gates as the strip below: a URL tab that is not on screen falls back
  // to Flow. Clearing that param is the list's job when the source changes.
  const availableTabKeys = useMemo((): SourceDetailTabKey[] => {
    const keys: SourceDetailTabKey[] = [
      'flow',
      'configuration',
      'sample-events',
    ];
    if (!isMainSource && isMetaSchemaDefined && isDeployed) {
      keys.push('processing');
    }
    if (isMetaSchemaDefined) {
      keys.push('columns', 'buildDeploy');
    }
    return keys;
  }, [isDeployed, isMainSource, isMetaSchemaDefined]);

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return isSourceDetailTabKey(tab) && availableTabKeys.includes(tab)
      ? tab
      : DEFAULT_SOURCE_DETAIL_TAB;
  }, [availableTabKeys, searchParams]);

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

  // A transform switch is a source write, and on a deployed source it lands on
  // a new version: without following it the page keeps reading the old one.
  const handleSourceUpdated = useCallback(
    (response: { source: string; current: string }) => {
      setSelectedSource({
        source_name: response.source,
        source_version: response.current,
      });
      refetchSources();
    },
    [refetchSources, setSelectedSource],
  );

  return (
    <Tabs
      classNames={{
        root: cn(
          'flex min-h-0 flex-1 flex-col -mt-3',
          '[&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-content-holder]:flex-1',
          '[&_.ant-tabs-content]:h-full',
        ),
        content: 'h-full pb-8 min-h-0',
      }}
      activeKey={activeTab}
      onChange={handleTabChange}
      items={[
        {
          key: 'flow',
          label: SOURCE_DETAIL_TAB_KEY_MAP['flow'],
          children: (
            <RbacProtected action={RbacProtected.rbacActions.source_read}>
              <RbacProtected.Unrestricted>
                <SourceFlowTabContent source={selectedSourceName} />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted className="h-full">
                <RbacProtected.RestrictedRoute />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },

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
                  <SampleEventsTabContent />
                </PromoteRowsProvider>
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted className="h-full">
                <RbacProtected.RestrictedRoute />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        ...(!isMainSource && isMetaSchemaDefined && isDeployed
          ? [
              {
                key: 'processing',
                label: SOURCE_DETAIL_TAB_KEY_MAP['processing'],
                children: (
                  <RbacProtected
                    action={RbacProtected.rbacActions.deployment_read}
                  >
                    <RbacProtected.Unrestricted>
                      <SourceProcessingTabContent
                        source={selectedSourceName}
                        transformSlot={
                          <SourceTransformSelector
                            // Keyed by source: a refusal is one deployment's answer
                            // about one source, and it must not follow the reader to
                            // the next one.
                            key={selectedSourceName}
                            source={selectedSourceName}
                            sourceDetail={sourceDetailData}
                            onSourceUpdated={handleSourceUpdated}
                          />
                        }
                      />
                    </RbacProtected.Unrestricted>
                    <RbacProtected.Restricted className="h-full">
                      <RbacProtected.RestrictedRoute />
                    </RbacProtected.Restricted>
                  </RbacProtected>
                ),
              },
            ]
          : []),

        /* Progressive disclosure - the next tab Items are hidden until meta schema is defined */
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
                key: 'buildDeploy',
                label: SOURCE_DETAIL_TAB_KEY_MAP['buildDeploy'],
                children: (
                  <RbacProtected action={RbacProtected.rbacActions.source_read}>
                    <RbacProtected.Unrestricted>
                      <SourceBuildDeployTabContent
                        source_name={selectedSourceName}
                        source_version={selectedSourceVersion}
                        build_result={sourceDetailData.version.source_build}
                        deploy_result={
                          sourceDetailData.version.source_deployment
                        }
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
