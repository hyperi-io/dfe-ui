import { GenericErrorCard } from '@/core/components/GenericError';
import { ViewSourceDetailTabs } from '@/Sources/components/ViewSourceTabs';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { SourceDetailActionMenu } from './SourceDetailActionMenu';
import { SourceEnabledTag } from './SourceEnabledTag';

export const ViewSourceDetail = () => {
  const {
    selectedSourceName: source_name,
    selectedSourceVersion: source_version,
  } = useListSourcesContext();

  const {
    sourceDetail: sourceDetailData,
    isLoadingSourceDetail,
    errorSourceDetail,
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

  return (
    <>
      <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
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
        <ViewSourceDetailTabs
          selectedSourceName={source_name ?? ''}
          selectedSourceVersion={source_version ?? ''}
          {...sourceDetailData}
        />
      </div>
    </>
  );
};
