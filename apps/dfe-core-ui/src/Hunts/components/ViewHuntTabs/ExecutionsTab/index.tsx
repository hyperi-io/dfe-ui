import { NotificationCard } from '@/core/components/NotificationCard';
import { Tooltip } from '@/core/components/Tooltip';
import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { Table } from '@/core/components/Table';
import { useFetchHuntExecutions } from '@/Hunts/hooks/useFetchHuntExecutions';
import { THuntExecutionsResponse } from '@/Hunts/hooks/useFetchHuntExecutions/types';
import { Button, Spin, Tag } from 'antd';

type THuntExecution = THuntExecutionsResponse['items'][number];

const PAGE_SIZE = 50;

const STATUS_COLOUR: Record<string, string> = {
  completed: 'green',
  failed: 'red',
};

const formatDuration = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;

const costLabel = ({ cost_estimate: cost }: THuntExecution) =>
  cost.estimated_rows === null || cost.estimated_rows === undefined
    ? 'Not measured'
    : `${cost.estimated_rows.toLocaleString()} rows in ${cost.window_minutes} min`;

const COLUMNS = [
  {
    title: 'Fired',
    dataIndex: 'fire',
    key: 'fire',
    render: (fire: number) => (
      <span className="whitespace-nowrap">{formatEpochSecondsLocal(fire)}</span>
    ),
    width: 200,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={STATUS_COLOUR[status]}>{status}</Tag>
    ),
    width: 110,
  },
  {
    title: 'Rows',
    dataIndex: 'rows_returned',
    key: 'rows_returned',
    align: 'right' as const,
    render: (rows: number) => (
      <span className="hyperi-ui-numerals">{rows.toLocaleString()}</span>
    ),
    width: 100,
  },
  {
    title: 'Duration',
    dataIndex: 'execution_time_ms',
    key: 'execution_time_ms',
    align: 'right' as const,
    render: (ms: number) => (
      <span className="hyperi-ui-numerals whitespace-nowrap">
        {formatDuration(ms)}
      </span>
    ),
    width: 110,
  },
  {
    title: 'Cost',
    key: 'cost',
    render: (_: unknown, execution: THuntExecution) => (
      <span className="whitespace-nowrap">{costLabel(execution)}</span>
    ),
    width: 200,
  },
  {
    title: 'Error',
    dataIndex: 'error',
    key: 'error',
    // Ellipsis on the cell clips a long error, and the tooltip carries all of it.
    ellipsis: { showTitle: false },
    width: 360,
    render: (error?: string | null) =>
      error ? (
        <Tooltip title={error} placement="topLeft">
          <span className="text-error">{error}</span>
        </Tooltip>
      ) : null,
  },
];

export const ExecutionsTab = ({ name }: { name: string }) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchHuntExecutions({ name, pageSize: PAGE_SIZE });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 w-full justify-center">
        <Spin /> <span className="sr-only">Loading hunt executions...</span>
      </div>
    );
  }

  // A failed next page keeps the rows already loaded, and Load more turns into Retry.
  if (error && data.length === 0) {
    return (
      <NotificationCard
        type="error"
        title="Error loading hunt executions"
        description={error.message}
      />
    );
  }

  if (data.length === 0) {
    return (
      <NotificationCard
        type="default"
        title="No executions found for this hunt"
        description="This hunt has not been executed yet."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Table
        rowKey="execution_id"
        columns={COLUMNS}
        dataSource={data}
        tableLayout="fixed"
      />
      {error && (
        <NotificationCard
          type="error"
          title="The next executions could not be loaded"
          description={error.message}
        />
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            htmlType="button"
            loading={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {error ? 'Retry' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
};
