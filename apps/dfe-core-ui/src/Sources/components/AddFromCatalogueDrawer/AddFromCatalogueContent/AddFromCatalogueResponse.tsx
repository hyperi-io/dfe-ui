import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { TCatalogueBulkSourceResponse } from '@/Sources/hooks/useCreateBulkSourceFromCatalogue/types';
import { IconCircleCheck, IconCircleX, IconLink } from '@repo/dfe-icons';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';

const formatCountTitleMessage = (created: number) => {
  return `${created} source${created === 1 ? '' : 's'}`;
};
export const AddFromCatalogueResponse = ({
  data,
}: {
  data?: TCatalogueBulkSourceResponse;
}) => {
  const failedCount = data?.failed.length ?? 0;
  const createdCount = data?.created.length ?? 0;

  const createdColumns: ColumnsType<
    TCatalogueBulkSourceResponse['created'][number]
  > = [
    {
      title: 'Catalogue Entry',
      dataIndex: 'entry',
    },
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'Deployed',
      dataIndex: 'deployed',
      width: 80,
      render: (deployed_version) => {
        return (
          <span className="flex items-center justify-center gap-1">
            {!!deployed_version ? (
              <IconCircleCheck className="text-green-500" />
            ) : (
              <IconCircleX className="text-red-500" />
            )}
          </span>
        );
      },
    },
    {
      dataIndex: 'current',
      width: 120,
      render: (version, record) => (
        <span className="flex items-center justify-center gap-1">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground dark:text-foreground-dark hover:underline"
            href={`/sources?source_name=${record.source}&source_version=${version}`}
          >
            View Source
          </Link>
          <IconLink />
        </span>
      ),
    },
  ];

  const failedColumns: ColumnsType<
    TCatalogueBulkSourceResponse['failed'][number]
  > = [
    {
      title: 'Catalogue Entry',
      dataIndex: 'entry',
      width: '20%',
    },
    {
      title: 'Error',
      width: '70%',
      dataIndex: 'message',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {failedCount > 0 && (
        <NotificationCard
          type="error"
          title={`${formatCountTitleMessage(failedCount)} failed`}
        >
          <Table
            rowKey="entry"
            scroll={{ x: '100%' }}
            dataSource={data?.failed}
            columns={failedColumns}
          />
        </NotificationCard>
      )}

      {createdCount > 0 && (
        <NotificationCard
          type="success"
          title={`${formatCountTitleMessage(createdCount)} created`}
        >
          <Table
            rowKey="entry"
            scroll={{ x: 'max-content' }}
            dataSource={data?.created}
            columns={createdColumns}
          />
        </NotificationCard>
      )}
    </div>
  );
};
