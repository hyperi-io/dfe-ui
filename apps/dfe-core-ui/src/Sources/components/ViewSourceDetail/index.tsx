import { GenericErrorCard } from '@/core/components/GenericError';
import { ViewSourceDetailTabs } from '@/Sources/components/ViewSourceTabs';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { SourceDetailActionMenu } from './SourceDetailActionMenu';
import { SourceEnabledTag } from './SourceEnabledTag';

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
          <h4 className="text-lg font-medium flex items-center gap-2 w-full">
            <span className="text-foreground/50 dark:text-dark-foreground/50">
              Source:
            </span>
            {sourceDetailData.display_name || sourceDetailData.source}
            <SourceEnabledTag
              className="text-sm font-normal max-h-6 ml-auto mr-2"
              enabled={sourceDetailData.enabled}
            />
          </h4>
          <SourceDetailActionMenu source={sourceDetailData} />
        </div>
        <ViewSourceDetailTabs
          selectedSourceName={source_name ?? ''}
          {...sourceDetailData}
        />
      </div>
    </>
  );
};
