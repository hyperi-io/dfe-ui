import { AceEditor } from '@/core/components/AceEditor';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useFetchSchemaDetail } from '@/Schemas/hooks/useFetchSchemaDetail';
import { notification, Spin, Typography } from 'antd';
import { EmptyDetail } from './EmptyDetail';

export const ListSchemaDetail = () => {
  const [_api, contextHolder] = notification.useNotification();
  const { selectedSchemaPath: schema_path } = useListSchemasContext();
  const {
    data: schemaDetailData,
    isLoading: isFetchingSchemaDetail,
    error: fetchSchemaDetailError,
  } = useFetchSchemaDetail({ schema_path: schema_path ?? '' });

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
      <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <Typography.Title level={5}>Schema Configuration</Typography.Title>
        <AceEditor
          value={JSON.stringify(schemaDetailData, null, 2)}
          mode="json"
          height="70%"
        />
      </div>
    </>
  );
};
