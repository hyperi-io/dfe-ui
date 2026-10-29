import { Table } from '@/core/components/Table';
import { TApplyDefaultsResponse } from '@/Platform/hooks/system/useApplyDefaults/types';
import { Tag } from 'antd';

export type TLiveApply = TApplyDefaultsResponse['live'][number];

const STATUS: Record<TLiveApply['status'], { label: string; color: string }> = {
  altered: { label: 'Altered', color: 'success' },
  unchanged: { label: 'Unchanged', color: 'default' },
  not_deployed: { label: 'Not deployed', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
};

const FIELD_LABEL: Record<TLiveApply['not_applied'][number]['field'], string> =
  {
    ttl_days: 'TTL days',
    engine: 'Engine',
    common_header_type: 'Common header type',
    common_header_version: 'Common header version',
  };

const None = () => (
  <span className="text-foreground/50 dark:text-dark-foreground/50">None</span>
);

/** What each Apply did to the source's deployed table, as the engine reports it. */
export const LiveApplyResult = ({ live }: { live: TLiveApply[] }) => (
  <section aria-label="What reached each table" className="flex flex-col gap-2">
    <h3 className="text-sm font-medium">What reached each table</h3>
    <Table<TLiveApply>
      rowKey="source"
      dataSource={live}
      columns={[
        { title: 'Source', dataIndex: 'source' },
        {
          title: 'Table',
          dataIndex: 'table',
          render: (table: TLiveApply['table']) => table ?? <None />,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (status: TLiveApply['status']) => (
            <Tag color={STATUS[status].color}>{STATUS[status].label}</Tag>
          ),
        },
        {
          title: 'TTL',
          dataIndex: 'ttl',
          render: (ttl: TLiveApply['ttl']) => ttl ?? <None />,
        },
        {
          title: 'Columns added',
          dataIndex: 'columns_added',
          render: (columns: TLiveApply['columns_added']) =>
            columns.length > 0 ? columns.join(', ') : <None />,
        },
        {
          title: 'Not applied',
          key: 'not_applied',
          render: (_: unknown, row: TLiveApply) => {
            if (row.reason) return row.reason;
            if (row.not_applied.length === 0) return <None />;
            return (
              <ul className="m-0 list-none p-0">
                {row.not_applied.map(({ field, reason }) => (
                  <li key={field}>
                    {FIELD_LABEL[field]}: {reason}
                  </li>
                ))}
              </ul>
            );
          },
        },
      ]}
    />
  </section>
);
