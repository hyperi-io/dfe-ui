import { NotificationCard } from '@/core/components/NotificationCard';
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
  onSuccess,
  onDataLoad,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: string[];
  onSuccess: (response: PromoteFieldResponse) => void;
  onDataLoad: (response: JsonPaths) => void;
}) => {
  const {
    mutate: promoteFields,
    isPending: isPromotingFields,
    error: errorPromotingFields,
  } = usePromoteFields({
    source_name: selectedSourceName,
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

  return (
    <div className="flex flex-col gap-y-4">
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
        onClick={() =>
          promoteFields({
            json_path: jsonPaths?.paths.map((path) => path.path) ?? [],
            dry_run: true,
            atomic: false,
          })
        }
      >
        Test Promote
      </Button>
    </div>
  );
};
