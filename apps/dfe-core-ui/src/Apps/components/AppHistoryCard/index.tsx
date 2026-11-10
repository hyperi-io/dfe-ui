'use client';

import { useFetchAppHistory } from '@/core/hooks/apps/instances/useFetchAppHistory';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { Spin, Tag } from 'antd';
import { UIEvent } from 'react';

const PAGE_SIZE = 20;
// The next page loads once the table is scrolled this close to its end
const LOAD_MORE_WITHIN_PX = 40;
const SCROLL_AFTER_ROWS = 5;
// About five small-table rows
const SCROLL_HEIGHT_PX = 200;

const STATE_COLOUR: Record<string, string> = {
  applied: 'green',
  pending: 'orange',
  committed: 'blue',
};

const COLUMNS = [
  {
    title: 'Commit',
    dataIndex: 'sha',
    key: 'sha',
    render: (value: string) => (
      <span className="font-mono text-xs">{value.slice(0, 7)}</span>
    ),
  },
  { title: 'Change', dataIndex: 'summary', key: 'summary' },
  { title: 'By', dataIndex: 'actor', key: 'actor' },
  {
    title: 'When',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (value: number) => new Date(value * 1000).toLocaleString(),
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    render: (value: string) => <Tag color={STATE_COLOUR[value]}>{value}</Tag>,
  },
];

/**
 * Every governed change to this instance, read straight out of the deploy
 * repo's history.
 *
 * State reads 'committed' unless the caller supplies the revision Argo has
 * synced, which this surface does not have - so a commit here means written
 * to git, not confirmed on the cluster.
 *
 * It loads a page of changes at a time, the next as the table scrolls to its end.
 */
export const AppHistoryCard = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchAppHistory({
    service,
    instance,
    pageSize: PAGE_SIZE,
  });

  const loadMoreNearTheEnd = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const nearTheEnd =
      scrollHeight - scrollTop - clientHeight < LOAD_MORE_WITHIN_PX;
    if (nearTheEnd && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <SectionCard title="History">
        <Spin size="small" />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="History">
        <NotificationCard
          type="info"
          variant="subtle"
          title="History is not available"
          description={error.message}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="History">
      <Table
        rowKey="sha"
        columns={COLUMNS}
        dataSource={data}
        // Past five changes the table scrolls rather than growing the page
        scroll={
          data.length > SCROLL_AFTER_ROWS ? { y: SCROLL_HEIGHT_PX } : undefined
        }
        onScroll={loadMoreNearTheEnd}
        footer={isFetchingNextPage ? () => <Spin size="small" /> : undefined}
      />
    </SectionCard>
  );
};
