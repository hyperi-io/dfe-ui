import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { Tabs } from 'antd';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';
import { HuntsTabContent } from './HuntsTabContent';
import { SampleEventsTabContent } from './SampleEventsTabContent';
import { SigmaTabContent } from './SigmaTabContent';
import { SourceColumnsTabContent } from './SourceColumnsTabContent';
import { SourceDdlPreviewTabContent } from './SourceDdlPreviewTabContent';
import { SourceRulesTabContent } from './SourceRulesTabContent';
import { TableStatsTabContent } from './TableStatsTabContent';

type ViewSourceDetailTabsProps = SourceDetail & {
  selectedSourceName: string;
};

export const ViewSourceDetailTabs = ({
  selectedSourceName,
  ...sourceDetailData
}: ViewSourceDetailTabsProps) => {
  return (
    <Tabs
      className="min-h-0 flex-1 -mt-3"
      items={[
        {
          key: 'configuration',
          label: 'Configuration Details',
          children: <ConfigurationDetailsTabContent {...sourceDetailData} />,
        },

        {
          key: 'sample-events',
          label: 'Sample Events',
          children: <SampleEventsTabContent source={selectedSourceName} />,
        },
        {
          key: 'table-stats',
          label: 'Table Statistics',
          children: <TableStatsTabContent />,
        },
        {
          key: 'columns',
          label: 'Columns',
          children: (
            <SourceColumnsTabContent source_name={selectedSourceName} />
          ),
        },
        {
          key: 'ddl-preview',
          label: 'DDL Preview',
          children: <SourceDdlPreviewTabContent />,
        },
        {
          key: 'sigma',
          label: 'Sigma',
          children: <SigmaTabContent />,
        },
        {
          key: 'hunts',
          label: 'Hunts',
          children: <HuntsTabContent />,
        },
        {
          key: 'rules',
          label: 'Rules',
          children: <SourceRulesTabContent />,
        },
      ]}
    />
  );
};
