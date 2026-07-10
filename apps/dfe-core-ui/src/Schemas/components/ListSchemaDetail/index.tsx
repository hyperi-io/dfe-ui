import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useFetchInfiniteFilteredSchemaDetailColumns } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import {
  SchemaDetailColumnFilterField,
  SchemaDetailColumnFilters,
} from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconLock } from '@repo/dfe-icons';
import { notification, Spin, Tooltip } from 'antd';
import { useCallback, useState } from 'react';
import { EmptyDetail } from './EmptyDetail';
import { ViewSchemaDetails } from './ViewSchemaDetails';

export const ListSchemaDetail = () => {
  const [_api, contextHolder] = notification.useNotification();
  const { selectedSchemaPath: schema_path, selectedSchemaVersion: version } =
    useListSchemasContext();
  const [columnFilters, setColumnFilters] = useState<SchemaDetailColumnFilters>(
    {},
  );
  const [columnFilterResetKey, setColumnFilterResetKey] = useState(0);

  const handleColumnFilterChange = useCallback(
    (filterKey: SchemaDetailColumnFilterField, value: string | undefined) => {
      setColumnFilters((previous) => {
        if (value === undefined) {
          const { [filterKey]: _removed, ...rest } = previous;
          return rest;
        }
        return { ...previous, [filterKey]: value };
      });
    },
    [],
  );

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnFilterResetKey((key) => key + 1);
  }, []);

  const {
    data: schemaDetailData,
    searchableColumnsOptions,
    selectedSearchableColumns,
    setSelectedSearchableColumns,
    isLoading: isFetchingSchemaDetail,
    error: fetchSchemaDetailError,
    refetch: refetchSchemaDetail,
    fetchNextPage: fetchNextPageSchemaDetail,
    hasNextPage: hasNextPageSchemaDetail,
    isFetchingNextPage: isFetchingNextPageSchemaDetail,
  } = useFetchInfiniteFilteredSchemaDetailColumns({
    schema_path: schema_path,
    version: version,
    per_page: 50,
    ...columnFilters,
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (!hasNextPageSchemaDetail || isFetchingNextPageSchemaDetail) return;

      // Fetch data when user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 40) {
        void fetchNextPageSchemaDetail();
      }
    },
    [
      hasNextPageSchemaDetail,
      isFetchingNextPageSchemaDetail,
      fetchNextPageSchemaDetail,
    ],
  );

  if (!schema_path || !version) {
    return <EmptyDetail />;
  }

  if (isFetchingSchemaDetail && !schemaDetailData)
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

  const coreResource = schemaDetailData.resource_type === RESOURCE_TYPES.CORE;

  return (
    <>
      {contextHolder}
      <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <span className="text-foreground/50 dark:text-dark-foreground/50">
            Schema Configuration:
          </span>
          {coreResource && (
            <Tooltip
              destroyOnHidden
              title={
                <div className="text-sm flex flex-col gap-1">
                  <span className="font-medium">Core Resource</span>
                  <span className="opacity-80">
                    Core resources are restricted and cannot be modified.
                  </span>
                </div>
              }
            >
              <IconLock />
            </Tooltip>
          )}{' '}
          {schema_path.split('/').pop()}
        </h4>
        <ViewSchemaDetails
          {...schemaDetailData}
          columnFilters={columnFilters}
          columnFilterResetKey={columnFilterResetKey}
          showSearchableColumns={{
            searchableColumnsOptions,
            selectedSearchableColumns: selectedSearchableColumns,
            setSelectedSearchableColumns: setSelectedSearchableColumns,
          }}
          onColumnFilterChange={handleColumnFilterChange}
          onClearAllFilters={handleClearAllFilters}
          onSuccess={() => {
            void refetchSchemaDetail();
          }}
          isLoading={isFetchingSchemaDetail || isFetchingNextPageSchemaDetail}
          onScroll={handleScroll}
        />
      </div>
    </>
  );
};
