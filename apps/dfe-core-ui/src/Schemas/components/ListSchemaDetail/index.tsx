import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useFetchInfiniteFilteredSchemaDetailColumns } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { notification, Spin, Typography } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { ViewSchemaDetails } from './ViewSchemaDetails';

export const ListSchemaDetail = () => {
  const [_api, contextHolder] = notification.useNotification();
  const { selectedSchemaPath: schema_path, selectedSchemaVersion: version } =
    useListSchemasContext();
  const {
    data: schemaDetailData,
    isLoading: isFetchingSchemaDetail,
    error: fetchSchemaDetailError,
    refetch: refetchSchemaDetail,
  } = useFetchInfiniteFilteredSchemaDetailColumns({
    schema_path: schema_path,
    version: version,
  });

  if (isFetchingSchemaDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchSchemaDetailError)
    return (
      <GenericErrorCard
        title="Error fetching schema detail"
        description={fetchSchemaDetailError.message}
      />
    );

  if (!schemaDetailData) {
    return <EmptyDetail />;
  }
  return (
    <>
      {contextHolder}
      <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <Typography.Title level={5}>Schema Configuration</Typography.Title>
        <ViewSchemaDetails
          {...schemaDetailData}
          refetchSchemaDetail={refetchSchemaDetail}
        />
      </div>
    </>
  );
};
