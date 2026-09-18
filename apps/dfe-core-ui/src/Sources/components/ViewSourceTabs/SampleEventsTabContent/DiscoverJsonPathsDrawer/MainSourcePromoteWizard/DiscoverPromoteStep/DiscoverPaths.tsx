import { NotificationCard } from '@/core/components/NotificationCard';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { cn } from '@/core/utils/style';
import { JsonPromoteColumnsTable } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/DiscoverJsonPathsDrawer/JsonPromoteColumnsTable';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { Button, Spin } from 'antd';
import { useMemo } from 'react';

export const DiscoverPaths = ({
  className,
  jsonPaths,
  isCreatedSchema,
  onClick = {
    createSchema: () => {},
  },
}: {
  className?: string;
  jsonPaths: {
    data: TJsonPathsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  onSuccess?: (schema: TCreateSchemaResponse) => void;
  isCreatedSchema: boolean;
  onClick: {
    createSchema: () => void;
  };
}) => {
  const tableValues = useMemo(
    () =>
      jsonPaths.data?.paths.map((path) => ({
        id: path.path,
        ...path.column,
        main_action: { ...path, column: undefined },
      })) ?? [],
    [jsonPaths],
  );

  if (jsonPaths.isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading JSON paths</p>
      </>
    );
  }

  if (jsonPaths.error) {
    return (
      <NotificationCard description={jsonPaths.error?.message} type="error" />
    );
  }

  return (
    <div className={cn(className, 'flex flex-col gap-4')}>
      <JsonPromoteColumnsTable
        title={
          tableValues.length > 0 ? (
            <>
              {tableValues.length} field
              {tableValues.length > 1 ? 's' : ''} selected to be promoted
            </>
          ) : (
            <>No JSON paths loaded</>
          )
        }
        tableValues={tableValues}
      />
      {!isCreatedSchema && (
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => {
              onClick?.createSchema?.();
            }}
          >
            Create Schema
          </Button>
        </div>
      )}
    </div>
  );
};
