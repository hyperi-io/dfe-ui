import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { JsonPaths } from '@/Sources/hooks/useFetchJsonPaths/types';
import { IconArrowMoveUp } from '@repo/dfe-icons';
import { Button, Spin, Tooltip } from 'antd';
import { useMemo } from 'react';

const EmptyCell = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const DiscoverJsonPathsDetails = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: string[];
}) => {
  const {
    data: jsonPaths,
    isLoading: isLoadingJsonPaths,
    error: errorJsonPaths,
  } = useFetchJsonPaths({
    source_name: selectedSourceName,
    version: selectedSourceVersion,
    paths: fieldsToPromote.join(','),
  });

  const columns = [
    {
      title: '',
      dataIndex: 'additionalInfo',
      key: 'additionalInfo',
      align: 'center' as const,
      width: 30,
      render: (value: JsonPaths['paths'][number]) => {
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
        return value ? value : <EmptyCell />;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (value: string) => {
        return value ? value : <EmptyCell />;
      },
    },
    {
      title: 'Index Type',
      dataIndex: 'use_case',
      key: 'use_case',
      render: (value: string) => {
        return value ? value : <EmptyCell />;
      },
    },
    {
      title: 'Attributes',
      dataIndex: 'attribute',
      key: 'attribute',
      render: (value: string[]) => {
        return value.length > 0 ? value.join(', ') : <EmptyCell />;
      },
    },
    {
      title: 'Expression (CTE)',
      dataIndex: 'expr',
      key: 'expr',
      render: (value: string) => {
        return value ? value : <EmptyCell />;
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (value: string) => {
        return value ? value : <EmptyCell />;
      },
    },
  ];

  const tableValues = useMemo(
    () =>
      jsonPaths?.paths.map((path) => ({
        id: path.path,
        ...path.column,
        additionalInfo: { ...path, column: undefined },
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

  return <Table dataSource={tableValues} columns={columns} />;
};
