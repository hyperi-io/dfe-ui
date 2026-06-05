import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { Spin, Tabs } from 'antd';
import { ConfigurationDetailsTabContent } from './ConfigurationDetailsTabContent';
import { EmptyDetail } from './EmptyDetail';
import { SampleEventsTabContent } from './SampleEventsTabContent';
import { SigmaTabContent } from './SigmaTabContent';
import { SourceColumnsTabContent } from './SourceColumnsTabContent';
import { SourceDdlPreviewTabContent } from './SourceDdlPreviewTabContent';
import { SourceDetailActionMenu } from './SourceDetailActionMenu';
import { SourceRulesTabContent } from './SourceRulesTabContent';
import { TableStatsTabContent } from './TableStatsTabContent';

export const ViewSourceDetail = () => {
  const { selectedSourceName: source_name } = useListSourcesContext();
  const {
    data: sourceDetailData,
    isLoading: isFetchingSourceDetail,
    error: fetchSourceDetailError,
  } = useFetchSourceDetail({ source_name });

  if (isFetchingSourceDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchSourceDetailError)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={fetchSourceDetailError.message}
      />
    );

  if (!sourceDetailData) {
    return <EmptyDetail />;
  }

  return (
    <>
      <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">
            <span className="text-foreground/50 dark:text-dark-foreground/50 mr-2">
              Source:
            </span>
            {sourceDetailData.display_name || sourceDetailData.source}
          </h4>
          <SourceDetailActionMenu source={sourceDetailData} />
        </div>
        <Tabs
          className="min-h-0 flex-1 -mt-3"
          items={[
            {
              key: 'configuration',
              label: 'Configuration Details',
              children: (
                <ConfigurationDetailsTabContent {...sourceDetailData} />
              ),
            },

            {
              key: 'sample-events',
              label: 'Sample Events',
              children: <SampleEventsTabContent />,
            },
            {
              key: 'table-stats',
              label: 'Table Statistics',
              children: <TableStatsTabContent />,
            },
            {
              key: 'columns',
              label: 'Columns',
              children: <SourceColumnsTabContent />,
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
              key: 'rules',
              label: 'Rules',
              children: <SourceRulesTabContent />,
            },
          ]}
        />
      </div>
    </>
  );
};
