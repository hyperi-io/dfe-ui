import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { ViewSourceDetailTabs } from '@/Sources/components/ViewSourceTabs';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { Button, Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { SourceDetailActionMenu } from './SourceDetailActionMenu';
import { SourceDetailHighlight } from './SourceDetailHighlight';
import { SourceEnabledTag } from './SourceEnabledTag';

export const ViewSourceDetail = () => {
  const {
    selectedSourceName: source_name,
    selectedSourceVersion: source_version,
    setSelectedSource,
  } = useListSourcesContext();

  const {
    sourceDetail: sourceDetailData,
    isLoadingSourceDetail,
    errorSourceDetail,
    isDeployed,
  } = useSourceDetailsContext();

  if (isLoadingSourceDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (errorSourceDetail)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={errorSourceDetail.message}
      />
    );

  if (!sourceDetailData) {
    return <EmptyDetail />;
  }

  const isCurrentDeployed =
    sourceDetailData.current === sourceDetailData.deployed_version;
  const isCurrentSharedTable =
    sourceDetailData.current_table_topic_type === 'main';
  const isActiveChanges = isDeployed && !isCurrentDeployed;
  const isMainSource = sourceDetailData.source === 'main';

  return (
    <>
      <div className="h-[calc(100vh-125px)] pr-4 flex flex-col gap-4 overflow-hidden min-h-0">
        <div className="flex shrink-0 items-center justify-between">
          <h4 className="flex items-center w-full gap-2 text-lg font-medium">
            <span className="text-foreground/50 dark:text-dark-foreground/50">
              Source Configuration:
            </span>
            {sourceDetailData.display_name || sourceDetailData.source}
            <SourceEnabledTag
              className="ml-auto mr-2 text-sm font-normal max-h-6"
              enabled={sourceDetailData.enabled}
              sourceName={sourceDetailData.source}
            />
          </h4>
          <SourceDetailActionMenu source={sourceDetailData} />
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          {((!isDeployed && !isCurrentSharedTable) ||
            (isActiveChanges && !isCurrentSharedTable)) &&
            !isMainSource && (
              <NotificationCard
                title="There are undeployed changes on the working branch"
                type="error"
                action={
                  <Button
                    onClick={() => {
                      setSelectedSource({
                        source_name: sourceDetailData.source,
                        source_version: sourceDetailData.current,
                        tab: 'buildDeploy',
                      });
                    }}
                    htmlType="button"
                    type="default"
                    danger
                  >
                    Go to Build & Deploy
                  </Button>
                }
              />
            )}

          <SourceDetailHighlight source={sourceDetailData} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <ViewSourceDetailTabs
            selectedSourceName={source_name ?? ''}
            selectedSourceVersion={source_version ?? ''}
            {...sourceDetailData}
          />
        </div>
      </div>
    </>
  );
};
