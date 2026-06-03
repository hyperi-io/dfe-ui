import { SchemaTable } from '@/core/components/SchemaTable';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateSchemaVersionDrawer } from '@/Schemas/components/CreateSchemaVersionDrawer';
import {
  MetaSchemaDetailResponse,
  SchemaDetailColumnFilterField,
  SchemaDetailColumnFilters,
} from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { components } from '@repo/dfe-engine-types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UIEventHandler, useCallback, useMemo } from 'react';
import {
  createSchemaDetailTextColumnFilter,
  renderSchemaDetailFilteredCell,
} from './ListSchemaDetail.helper';
import { UpdateCurrentVersionSelect } from './UpdateCurrentVersionSelect';
import { UpdateVersionSummaryInput } from './UpdateVersionSummaryInput';

interface ViewSchemaDetailsProps extends MetaSchemaDetailResponse {
  columnFilters: SchemaDetailColumnFilters;
  columnFilterResetKey: number;
  onColumnFilterChange: (
    filterKey: SchemaDetailColumnFilterField,
    value: string | undefined,
  ) => void;
  onClearAllFilters: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  onScroll?: UIEventHandler<HTMLDivElement>;
  showSearchableColumns?: {
    searchableColumnsOptions: {
      label: string;
      value: SchemaDetailColumnFilterField;
    }[];
    selectedSearchableColumns: string[];
    setSelectedSearchableColumns: (value: string[]) => void;
  };
}

type SchemaColumnItem =
  components['schemas']['MetaSchemaGetResponse']['version']['columns']['items'][number];

export const ViewSchemaDetails = ({
  current: currentVersion,
  versions: allVersions,
  version: selectedVersion,
  path,
  columnFilters,
  columnFilterResetKey,
  onColumnFilterChange,
  onSuccess,
  isLoading,
  onScroll,
  onClearAllFilters,
  showSearchableColumns,
}: ViewSchemaDetailsProps) => {
  const {
    selectedSchemaVersion,
    setSelectedSchema,
    refetch: refetchListSchemas,
  } = useListSchemasContext();
  const handleSetSelectedSchema = useCallback(
    (version: string) => {
      setSelectedSchema({
        schema_path: path,
        schema_version: version,
      });
      onClearAllFilters();
    },
    [path, setSelectedSchema, onClearAllFilters],
  );

  const { componentHeight } = useSetComponentHeight({
    offset: 360,
  });

  const tableColumns = useMemo((): ColumnsType<SchemaColumnItem> => {
    const columnFilter = (
      title: string,
      filterKey: SchemaDetailColumnFilterField,
    ) =>
      createSchemaDetailTextColumnFilter<SchemaColumnItem>(
        title,
        filterKey,
        columnFilters[filterKey],
        columnFilterResetKey,
        onColumnFilterChange,
      );

    return [
      {
        dataIndex: 'name',
        key: 'name',
        ...columnFilter('Name', 'name'),
        render: (name: string) =>
          renderSchemaDetailFilteredCell({
            value: name,
            filterTerms: [columnFilters.name, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'name',
              ) ?? false,
          }),
      },
      {
        dataIndex: 'type',
        key: 'type',
        ...columnFilter('Type', 'type'),
        render: (type: string) =>
          renderSchemaDetailFilteredCell({
            value: type,
            filterTerms: [columnFilters.type, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'type',
              ) ?? false,
          }),
      },
      {
        dataIndex: 'attribute',
        key: 'attribute',
        ...columnFilter('Attribute', 'attribute'),
        render: (attribute: string[]) =>
          renderSchemaDetailFilteredCell({
            value: attribute?.length > 0 ? attribute.join(', ') : undefined,
            filterTerms: [columnFilters.attribute, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'attribute',
              ) ?? false,
          }),
      },
      {
        dataIndex: 'use_case',
        key: 'use_case',
        ...columnFilter('Index Type', 'use_case'),
        render: (use_case: string) =>
          renderSchemaDetailFilteredCell({
            value: use_case,
            filterTerms: [columnFilters.use_case, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'use_case',
              ) ?? false,
          }),
      },
      {
        dataIndex: 'expr',
        key: 'expr',
        ...columnFilter('Expression (CTE)', 'expr'),
        render: (expr: string) =>
          renderSchemaDetailFilteredCell({
            value: expr,
            filterTerms: [columnFilters.expr, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'expr',
              ) ?? false,
          }),
      },
      {
        dataIndex: 'comment',
        key: 'comment',
        ...columnFilter('Comment', 'comment'),
        render: (comment: string) =>
          renderSchemaDetailFilteredCell({
            value: comment,
            filterTerms: [columnFilters.comment, columnFilters.search],
            isSearchable:
              showSearchableColumns?.selectedSearchableColumns.includes(
                'comment',
              ) ?? false,
          }),
      },
    ];
  }, [
    columnFilters,
    columnFilterResetKey,
    onColumnFilterChange,
    showSearchableColumns,
  ]);

  const versions = useMemo(() => {
    return allVersions.map((version) => ({
      label: `${version}${currentVersion === version ? ' (Current)' : ''}`,
      value: version,
    }));
  }, [allVersions, currentVersion]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full justify-between">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
            File pathname:
          </dt>
          <dd>{path}.yaml</dd>
          <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
            Current Version:
          </dt>
          <dd>
            <UpdateCurrentVersionSelect
              versions={versions}
              path={path}
              currentVersion={currentVersion}
              onSuccess={(values) => {
                handleSetSelectedSchema(values.current);
                void refetchListSchemas();
                onSuccess?.();
              }}
            />
          </dd>
          <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
            Summary:
          </dt>
          <dd>
            <UpdateVersionSummaryInput
              path={path}
              version={selectedSchemaVersion ?? ''}
              summary={selectedVersion.summary}
              onSuccess={onSuccess}
            />
          </dd>
        </dl>

        <div className="flex flex-col gap-2 items-center justify-end">
          <div className="flex flex-row gap-2 items-center mb-auto">
            <p>Version:</p>
            <Select
              className="w-48"
              options={versions}
              value={selectedSchemaVersion}
              onChange={(value) => {
                handleSetSelectedSchema(value);
              }}
            />
          </div>
          <CreateSchemaVersionDrawer classNames={{ trigger: 'ml-auto' }} />
        </div>
      </div>

      <SchemaTable<SchemaColumnItem>
        columns={tableColumns}
        visibleColumns={['name', 'type']}
        showSearchableColumns={showSearchableColumns}
        title={() => (
          <div className="flex items-center justify-between w-full">
            <p>{selectedVersion.columns.total} columns</p>

            <div className="flex items-center gap-2">
              <Input.Search
                allowClear
                className="w-48"
                placeholder="Search columns"
                value={columnFilters.search ?? ''}
                onChange={(e) => {
                  onColumnFilterChange('search', e.target.value || undefined);
                }}
              />
              <Button
                onClick={() => {
                  onClearAllFilters();
                }}
                htmlType="button"
                disabled={Object.keys(columnFilters).length === 0}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
        dataSource={selectedVersion.columns.items}
        rowKey="name"
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: (
            <div className="flex items-center justify-center gap-2 text-foreground-muted dark:text-dark-foreground-muted">
              <IconInfoCircle className="w-4 h-4" />
              <p>No columns loaded</p>
            </div>
          ),
        }}
        scroll={{ y: componentHeight }}
        onScroll={onScroll}
      />
    </div>
  );
};
