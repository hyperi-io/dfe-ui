import { NotificationCard } from '@/core/components/NotificationCard';
import { JsonPromoteColumnsTable } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/JsonPromoteColumnsTable';
import { JsonPaths } from '@/Sources/hooks/useFetchJsonPaths/types';
import { usePromoteFields } from '@/Sources/hooks/usePromoteFields';
import { PromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { Button } from 'antd';
import { useMemo } from 'react';
import { PromoteJsonPathsResultCard } from './PromoteJsonPathsResultCard';

export const PromoteJsonPaths = ({
  selectedSourceName,
  data,
  jsonPaths,
  onSuccess,
}: {
  selectedSourceName: string;
  data: PromoteFieldResponse | null;
  jsonPaths: JsonPaths | null;
  onSuccess?: () => void;
}) => {
  const {
    mutate: promoteFields,
    isPending: isPromotingFields,
    error: errorPromotingFields,
  } = usePromoteFields({
    source_name: selectedSourceName,
    onSuccess,
  });

  const handlePromoteFields = () => {
    promoteFields({
      json_path: jsonPaths?.paths.map((path) => path.path) ?? [],
      dry_run: false,
      atomic: false,
    });
  };

  const tableValues = useMemo(() => {
    return (
      data?.diff?.new_columns?.map((column) => ({
        ...column,
        attribute: column.attribute?.split(','),
        id: column.name,
      })) ?? []
    );
  }, [data?.diff?.new_columns]);
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-4 max-h-[calc(100vh-230px)] css-custom-scrollbar">
        <JsonPromoteColumnsTable
          tableValues={tableValues}
          title={
            <h2 className="font-semibold">
              The following columns will be created:
            </h2>
          }
        />
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
