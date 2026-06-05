import { AceEditor } from '@/core/components/AceEditor';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';

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
            <span className="text-foreground/50 dark:text-dark-foreground/50 mr-2 font-normal">
              Source:
            </span>
            {sourceDetailData.display_name || sourceDetailData.source}
          </h4>
        </div>
        <AceEditor
          value={JSON.stringify(sourceDetailData, null, 2)}
          mode="json"
          height="70%"
        />
      </div>
    </>
  );
};
