import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { MetaSchemaSelectCreate } from '@/Sources/components/CreateUpdateSourceForm/SchemaConfigTabContent/MetaSchemaSelectCreate';
import { JsonPromoteColumnsTable } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/JsonPromoteColumnsTable';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { JsonPaths } from '@/Sources/hooks/useFetchJsonPaths/types';
import { usePromoteFields } from '@/Sources/hooks/usePromoteFields';
import { PromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { Button, Spin } from 'antd';
import { useEffect, useMemo } from 'react';

export const DiscoverJsonPathsDetails = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
  isSchemaDefined,
  onSuccess,
  onDataLoad,
  setAttachedSchemaPath,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: string[];
  isSchemaDefined: boolean;
  onSuccess: (response: PromoteFieldResponse) => void;
  onDataLoad: (response: JsonPaths) => void;
  setAttachedSchemaPath?: (schemaPath: string) => void;
}) => {
  const [form] = Form.useForm<{ schema_path: string }>();
  const {
    mutate: promoteFields,
    isPending: isPromotingFields,
    error: errorPromotingFields,
  } = usePromoteFields({
    source_name: selectedSourceName,
    source_version: selectedSourceVersion,
    onSuccess,
  });

  const {
    data: jsonPaths,
    isLoading: isLoadingJsonPaths,
    error: errorJsonPaths,
  } = useFetchJsonPaths({
    source_name: selectedSourceName,
    version: selectedSourceVersion,
    paths: fieldsToPromote.join(','),
  });

  useEffect(() => {
    if (jsonPaths) {
      onDataLoad(jsonPaths);
    }
  }, [jsonPaths, onDataLoad]);

  const tableValues = useMemo(
    () =>
      jsonPaths?.paths.map((path) => ({
        id: path.path,
        ...path.column,
        main_action: { ...path, column: undefined },
      })) ?? [],
    [jsonPaths],
  );

  if (isLoadingJsonPaths) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading JSON paths</p>
      </>
    );
  }

  if (errorJsonPaths) {
    return (
      <NotificationCard description={errorJsonPaths.message} type="error" />
    );
  }

  const handleTestPromoteSubmit = () => {
    void form.validateFields().then((values) => {
      promoteFields({
        json_path: fieldsToPromote.join(','),
        dry_run: true,
        atomic: false,
        schema_path: values.schema_path,
      });
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      {!isSchemaDefined && (
        <NotificationCard
          title="No schema defined for this source"
          description="There is no schema defined for this source. Select a schema to extend to promote fields."
          type="action"
          action={
            <Form form={form}>
              <Form.Item
                name="schema_path"
                className="w-full flex items-center justify-center h-full"
                rules={[{ required: true, message: 'Please select a schema' }]}
              >
                <MetaSchemaSelectCreate
                  onChange={(value) => {
                    if (value) {
                      setAttachedSchemaPath?.(value);
                    }
                  }}
                />
              </Form.Item>
            </Form>
          }
        />
      )}

      <JsonPromoteColumnsTable
        title={
          tableValues.length > 0 ? (
            <>
              {tableValues.length} field{tableValues.length > 1 ? 's' : ''}{' '}
              selected to be promoted
            </>
          ) : (
            <>No JSON paths loaded</>
          )
        }
        tableValues={tableValues}
      />

      {errorPromotingFields && (
        <NotificationCard
          description={errorPromotingFields.message}
          type="error"
        />
      )}
      <Button
        className="ml-auto"
        type="primary"
        loading={isPromotingFields}
        onClick={handleTestPromoteSubmit}
      >
        Test Promote
      </Button>
    </div>
  );
};
