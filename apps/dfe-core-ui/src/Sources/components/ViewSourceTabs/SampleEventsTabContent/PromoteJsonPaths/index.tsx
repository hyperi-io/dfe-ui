import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { NotificationCard } from '@/core/components/NotificationCard';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { JsonPromoteColumnsTable } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/JsonPromoteColumnsTable';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { usePromoteFields } from '@/Sources/hooks/usePromoteFields';
import { PromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { Button } from 'antd';
import { useMemo } from 'react';
import { PromoteJsonPathsResultCard } from './PromoteJsonPathsResultCard';

export const PromoteJsonPaths = ({
  selectedSourceName,
  selectedSourceVersion,
  data,
  jsonPaths,
  onSuccess,
  attachedSchemaPath,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  data: PromoteFieldResponse | null;
  jsonPaths: TJsonPathsResponse | null;
  onSuccess?: (response: PromoteFieldResponse) => void;
  attachedSchemaPath?: string | null;
}) => {
  const { handleClearFieldsToPromote } = usePromoteRowsContext();
  const {
    mutate: promoteFieldsMutation,
    isPending: isPromotingFields,
    error: errorPromotingFields,
  } = usePromoteFields({
    source_name: selectedSourceName,
    source_version: selectedSourceVersion,
    onSuccess: (response) => {
      handleClearFieldsToPromote();
      onSuccess?.(response);
    },
  });

  const handlePromoteFields = () => {
    promoteFieldsMutation({
      json_path: jsonPaths?.paths.map((path) => path.path) ?? [],
      dry_run: false,
      atomic: false,
      schema_path: attachedSchemaPath,
    });
  };

  const tableValues = useMemo(() => {
    return (
      data?.diff?.new_columns?.map((column) => ({
        ...column,
        attribute: column.attribute?.split(','),
        id: column.name,
        _field_type: column._field_type || SCHEMA_FIELD_TYPES.USER_DEFINED,
      })) ?? []
    );
  }, [data?.diff?.new_columns]);
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-4 max-h-[calc(100vh-230px)] css-custom-scrollbar">
        {tableValues.length > 0 ? (
          <JsonPromoteColumnsTable
            tableValues={tableValues}
            title={
              <h2 className="font-semibold">
                The following columns will be created:
              </h2>
            }
          />
        ) : (
          <NotificationCard
            description="None of the selected fields can be promoted"
            type="warning"
          />
        )}
        <ul className="flex flex-col gap-y-2">
          {data?.results.map((result, index) => (
            <li key={result.json_path}>
              <PromoteJsonPathsResultCard
                result={result}
                ddl={data?.diff?.ddl?.[index]}
                copyDirective={data?.diff?.copy_directives?.[index]}
              />
            </li>
          ))}
        </ul>

        {errorPromotingFields && (
          <NotificationCard
            description={errorPromotingFields.message}
            type="error"
          />
        )}
      </div>

      <Button
        className="ml-auto"
        type="primary"
        loading={isPromotingFields}
        onClick={handlePromoteFields}
      >
        Promote Fields
      </Button>
    </div>
  );
};
