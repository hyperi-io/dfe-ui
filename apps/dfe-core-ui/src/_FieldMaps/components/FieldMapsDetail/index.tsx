import { AceEditor } from '@/core/components/AceEditor';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListFieldMapsContext } from '@/core/contexts/ListFieldMapsContext';
import { useFetchFieldMapDetail } from '@/core/hooks/useFetchFieldMapDetail';
import { Spin } from 'antd';

export const FieldMapsDetail = () => {
  const { selectedFieldMap } = useListFieldMapsContext();
  const {
    data: fieldMapDetailData,
    isLoading: isFetchingFieldMapDetail,
    error: fetchFieldMapDetailError,
  } = useFetchFieldMapDetail({
    standard: selectedFieldMap?.map_standard ?? null,
    source: selectedFieldMap?.map_source ?? null,
  });

  if (isFetchingFieldMapDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchFieldMapDetailError)
    return (
      <GenericErrorCard
        title="Error fetching source detail"
        description={fetchFieldMapDetailError.message}
      />
    );

  if (!fieldMapDetailData) {
    return (
      <EmptyDetail
        title="No field map selected"
        description="Please add or select a field map to see the detail."
      />
    );
  }
  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4">
      <div className="flex items-center justify-between mb-4 text-sm text-error border border-error rounded-md p-2">
        TODO: Add field map detail here
      </div>
      <AceEditor
        value={JSON.stringify(fieldMapDetailData, null, 2)}
        mode="json"
        height="70%"
      />
    </div>
  );
};
