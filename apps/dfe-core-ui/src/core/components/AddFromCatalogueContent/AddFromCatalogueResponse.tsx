import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { TCatalogueBulkSourceResponse } from '@/core/hooks/useCreateBulkSourceFromCatalogue/types';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconLink,
} from '@repo/dfe-icons';
import { cn } from '@repo/dfe-shared-ui';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useState } from 'react';

const formatCountTitleMessage = (created: number) => {
  return `${created} source${created === 1 ? '' : 's'}`;
};
export const AddFromCatalogueResponse = ({
  data,
  className,
}: {
  data?: TCatalogueBulkSourceResponse;
  className?: string;
}) => {
  const failedCount = data?.failed.length ?? 0;
  const createdCount = data?.created.length ?? 0;

  const [showSuccessful, setShowSuccessful] = useState(failedCount === 0);
  const [showFailed, setShowFailed] = useState(false);

  const { componentHeight: scrollHeight } = useSetComponentHeight({
    offset: 120,
  });

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
    <CustomScrollbar
      height={scrollHeight}
      className={cn('flex flex-col gap-2', className)}
    >
      {failedCount > 0 && (
        <NotificationCard
          type="error"
          title={
            <button
              className="ml-auto mr-0 font-medium flex justify-between w-full items-center"
              onClick={() => setShowFailed(!showFailed)}
              aria-label="Toggle failed sources"
            >
              <span className="mr-2">
                {showFailed ? <IconChevronUp /> : <IconChevronDown />}
              </span>
              {`${formatCountTitleMessage(failedCount)} failed`}
            </button>
          }
          showChildren={showFailed}
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
          title={
            <button
              className="ml-auto mr-0 font-medium flex justify-between w-full items-center"
              onClick={() => setShowSuccessful(!showSuccessful)}
              aria-label="Toggle created sources"
            >
              <span className="mr-2">
                {showSuccessful ? <IconChevronUp /> : <IconChevronDown />}
              </span>
              {`${formatCountTitleMessage(createdCount)} created`}
            </button>
          }
          showChildren={showSuccessful}
        >
          <Table
            rowKey="entry"
            scroll={{ x: 'max-content' }}
            dataSource={data?.created}
            columns={createdColumns}
          />
        </NotificationCard>
      )}
    </CustomScrollbar>
  );
};
