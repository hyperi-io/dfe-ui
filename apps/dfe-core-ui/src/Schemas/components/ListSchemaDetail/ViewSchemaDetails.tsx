import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { MetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Select, Table } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { UpdateCurrentVersionSelect } from './UpdateCurrentVersionSelect';
import { UpdateVersionSummaryInput } from './UpdateVersionSummaryInput';

interface ViewSchemaDetailsProps extends MetaSchemaDetailResponse {
  refetchSchemaDetail: () => void;
}

export const ViewSchemaDetails = ({
  current: currentVersion,
  versions: allVersions,
  version: selectedVersion,
  path,
  refetchSchemaDetail,
}: ViewSchemaDetailsProps) => {
  const { selectedSchemaVersion, setSelectedSchema } = useListSchemasContext();
  const [showVersion, setShowVersion] = useState<string>(
    selectedSchemaVersion as string,
  );

  const handleSetSelectedSchema = useCallback(
    (version: string) => {
      setSelectedSchema({
        schema_path: path,
        schema_version: version,
      });
      setShowVersion(version);
    },
    [path, setSelectedSchema, setShowVersion],
  );

  const { componentHeight } = useSetComponentHeight({
    offset: 360,
  });

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
      render: (attribute: string[]) => {
        return attribute?.length > 0 ? (
          attribute.join(', ')
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Use Case',
      dataIndex: 'use_case',
      key: 'use_case',
      render: (use_case: string) => {
        return use_case ? (
          use_case
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Expr',
      dataIndex: 'expr',
      key: 'expr',
      render: (expr: string) => {
        return expr ? (
          expr
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => {
        return comment ? (
          comment
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
  ];

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
              refetchSchemaDetail={refetchSchemaDetail}
              handleSetSelectedSchema={handleSetSelectedSchema}
            />
          </dd>
          <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
            Summary:
          </dt>
          <dd>
            <UpdateVersionSummaryInput
              path={path}
              version={showVersion}
              summary={selectedVersion.summary}
              refetchSchemaDetail={refetchSchemaDetail}
            />
          </dd>
        </dl>

        <div className="flex flex-row gap-2 items-center mb-auto">
          <p>Version:</p>
          <Select
            className="w-48"
            options={versions}
            value={showVersion}
            onChange={(value) => {
              handleSetSelectedSchema(value);
            }}
          />
        </div>
      </div>

      <Table
        columns={tableColumns}
        dataSource={selectedVersion.columns.items}
        rowKey="name"
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        locale={{
          emptyText: (
            <div className="flex items-center justify-center gap-2 text-foreground-muted dark:text-dark-foreground-muted">
              <IconInfoCircle className="w-4 h-4" />
              <p>No columns loaded</p>
            </div>
          ),
        }}
        scroll={{ y: componentHeight }}
      />
    </div>
  );
};
