import { SchemaColumnRow } from '@/core/components/CreateSchemaForm/AddSchemaTable/types';
import { SchemaTable } from '@/core/components/SchemaTable';
import { TableProps } from '@/core/components/Table';
import { JsonPaths } from '@/Sources/hooks/useFetchJsonPaths/types';
import { IconArrowMoveUp } from '@repo/dfe-icons';
import { Button, Input, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import Highlighter from 'react-highlight-words';

const EmptyCell = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

const buildColumns = (search: string) => [
  {
    title: '',
    dataIndex: 'main_action',
    key: 'main_action',
    align: 'center' as const,
    width: 30,
    render: (value: JsonPaths['paths'][number] | undefined) => {
      if (!value) {
        return null;
      }
      const {
        path,
        coverage_pct,
        types,
        is_consistent,
        promoted_to,
        column,
        distinct_count,
        samples,
      } = value;

      return (
        <Tooltip
          classNames={{
            container: 'w-fit',
            root: 'w-fit max-w-full',
          }}
          title={
            <div className="flex flex-col gap-y-1">
              <h1 className="text-sm font-medium">Additional Information</h1>
              <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-4">
                {path && (
                  <>
                    <dt>Path</dt>
                    <dd>{value?.path}</dd>
                  </>
                )}
                {types && types.length > 0 && (
                  <>
                    <dt>Types</dt>
                    <dd>{types.join(', ')}</dd>
                  </>
                )}
                {is_consistent && (
                  <>
                    <dt>Is Consistent</dt>
                    <dd>{is_consistent ? 'Yes' : 'No'}</dd>
                  </>
                )}
                {coverage_pct && (
                  <>
                    <dt>Coverage %</dt>
                    <dd>{coverage_pct}</dd>
                  </>
                )}
                {promoted_to && (
                  <>
                    <dt>Promoted To</dt>
                    <dd>{promoted_to}</dd>
                  </>
                )}
                {column && (
                  <>
                    <dt>Column</dt>
                    <dd>{column.name}</dd>
                  </>
                )}
                {distinct_count && (
                  <>
                    <dt>Distinct Count</dt>
                    <dd>{distinct_count}</dd>
                  </>
                )}
                {samples && samples.length > 0 && (
                  <>
                    <dt>Samples</dt>
                    <dd>{samples.join(', ')}</dd>
                  </>
                )}
              </dl>
            </div>
          }
          destroyOnHidden
        >
          <Button
            icon={<IconArrowMoveUp />}
            size="small"
            shape="circle"
            type="default"
          />
        </Tooltip>
      );
    },
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => {
      return value ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (value: string) => {
      return value ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    title: 'Index Type',
    dataIndex: 'use_case',
    key: 'use_case',
    render: (value: string) => {
      return value ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    title: 'Attributes',
    dataIndex: 'attribute',
    key: 'attribute',
    render: (value: string[] | undefined) => {
      return value && value.length > 0 ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value.join(', ')}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    title: 'Expression (CTE)',
    dataIndex: 'expr',
    key: 'expr',
    render: (value: string) => {
      return value ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    title: 'Comment',
    dataIndex: 'comment',
    key: 'comment',
    render: (value: string) => {
      return value ? (
        <Highlighter
          highlightClassName="bg-yellow-200"
          searchWords={[search]}
          textToHighlight={value}
          autoEscape
        />
      ) : (
        <EmptyCell />
      );
    },
  },
];

export const JsonPromoteColumnsTable = ({
  tableValues,
  title,
}: {
  tableValues: TableProps<
    SchemaColumnRow & { main_action?: Partial<JsonPaths['paths'][number]> }
  >['dataSource'];
  title: string | React.ReactNode;
}) => {
  const [search, setSearch] = useState('');

  const showMainActionColumn = useMemo(
    () => tableValues?.some((row) => row?.main_action != null) ?? false,
    [tableValues],
  );

  const filteredTableValues = useMemo(() => {
    return tableValues?.filter((path) => {
      return (
        path?.name?.toLowerCase().includes(search.toLowerCase()) ||
        path?.type?.toLowerCase().includes(search.toLowerCase()) ||
        path?.expr?.toLowerCase().includes(search.toLowerCase()) ||
        path?.comment?.toLowerCase().includes(search.toLowerCase()) ||
        path?.attribute
          ?.join(', ')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        path?.use_case?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [tableValues, search]);

  const columns = useMemo(() => {
    const all = buildColumns(search);
    return showMainActionColumn
      ? all
      : all.filter((column) => column.key !== 'main_action');
  }, [search, showMainActionColumn]);

  const lockedColumns = showMainActionColumn
    ? (['main_action', 'name'] as const)
    : (['name'] as const);

  return (
    <SchemaTable
      title={() => (
        <div className="flex items-center justify-between w-full">
          {title && title}
          <Input.Search
            className="ml-auto w-96"
            placeholder="Search JSON paths"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      lockedColumns={[...lockedColumns]}
      visibleColumns={['type', 'expr', 'comment']}
      dataSource={filteredTableValues}
      columns={columns}
    />
  );
};
