import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { TDryRunAppFileResponse } from '@/core/hooks/apps/files/useDryRunAppFile/types';
import { Tag } from 'antd';

const EVENT_COLUMNS = [
  { title: '#', dataIndex: 'index', key: 'index', width: 48 },
  {
    title: 'Before',
    dataIndex: 'before',
    key: 'before',
    render: (value: string) => (
      <pre className="max-w-100 overflow-x-auto text-xs">{value}</pre>
    ),
  },
  {
    title: 'After',
    dataIndex: 'after',
    key: 'after',
    render: (value: string, row: { error?: string; dropped?: boolean }) => {
      if (row.error)
        return <span className="text-error text-xs">{row.error}</span>;
      if (row.dropped) return <Tag>dropped</Tag>;
      return <pre className="max-w-100 overflow-x-auto text-xs">{value}</pre>;
    },
  },
];

/**
 * What the program did to each sampled event.
 *
 * A dry run reads real rows and writes nothing, so the interesting states are
 * not just pass and fail: 'unavailable' means no backend could run it and
 * 'disabled' means this deployment has dry runs switched off. Neither is a
 * pass, and neither is a failure of the file.
 */
export const DryRunResult = ({
  result,
}: {
  result: TDryRunAppFileResponse;
}) => {
  if (result.status !== 'completed') {
    return (
      <NotificationCard
        type={result.status === 'failed' ? 'error' : 'info'}
        title={`Dry run ${result.status}`}
        description={result.message || undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{`source ${result.source}`}</Tag>
        <Tag>{`sampled ${result.sampled}`}</Tag>
        <Tag color="green">{`succeeded ${result.succeeded}`}</Tag>
        {result.failed > 0 && (
          <Tag color="red">{`failed ${result.failed}`}</Tag>
        )}
        {result.dropped > 0 && <Tag>{`dropped ${result.dropped}`}</Tag>}
        {result.truncated && <Tag color="orange">truncated</Tag>}
      </div>
      <Table
        rowKey="index"
        columns={EVENT_COLUMNS}
        dataSource={result.events ?? []}
      />
    </div>
  );
};
