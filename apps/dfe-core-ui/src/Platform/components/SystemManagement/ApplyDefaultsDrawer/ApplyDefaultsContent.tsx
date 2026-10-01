import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { useFetchInfiniteDefaultsDriftSources } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources';
import { Checkbox, Tag } from 'antd';

const NoDriftTag = () => {
  return (
    <span className="text-foreground/50 dark:text-foreground/50">No drift</span>
  );
};
const DriftTag = ({
  current,
  defaultValue,
}: {
  current: string | number | null;
  defaultValue: string | number | null;
}) => {
  return (
    <span className="flex items-center gap-2">
      <Tag color="warning">Drift</Tag>
      Current: {current} | Default: {defaultValue}
    </span>
  );
};
export const ApplyDefaultsContent = () => {
  const {
    data: { items: defaultsDriftSources } = {},
    isLoading,
    error,
  } = useFetchInfiniteDefaultsDriftSources();

  const columns = [
    {
      dataIndex: 'selected',
      render: (selected: boolean) => {
        return <Checkbox checked={selected} />;
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'TTL Days',
      dataIndex: 'ttl_days',
      render: (ttl_days: {
        stored: string | number | null;
        default: string | number | null;
      }) => {
        if (ttl_days.stored === ttl_days.default) {
          return <NoDriftTag />;
        }
        return (
          <Tooltip
            title={`Current TTL days on source is ${ttl_days.stored} and default is ${ttl_days.default}`}
          >
            <DriftTag
              current={ttl_days.stored}
              defaultValue={ttl_days.default}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Engine',
      dataIndex: 'engine',
      render: (engine: {
        stored: string | number | null;
        default: string | number | null;
      }) => {
        if (engine.stored === engine.default) {
          return <NoDriftTag />;
        }
        return (
          <Tooltip
            title={`Current engine on source is ${engine.stored} and default is ${engine.default}`}
          >
            <DriftTag current={engine.stored} defaultValue={engine.default} />
          </Tooltip>
        );
      },
    },
    {
      title: 'Common Header Type',
      dataIndex: 'common_header_type',
      render: (common_header_type: {
        stored: string | number | null;
        default: string | number | null;
      }) => {
        if (common_header_type.stored === common_header_type.default) {
          return <NoDriftTag />;
        }
        return (
          <Tooltip
            title={`Current common header type on source is ${common_header_type.stored} and default is ${common_header_type.default}`}
          >
            <DriftTag
              current={common_header_type.stored}
              defaultValue={common_header_type.default}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Common Header Version',
      dataIndex: 'common_header_version',
      render: (common_header_version: {
        stored: string | number | null;
        default: string | number | null;
      }) => {
        if (common_header_version.stored === common_header_version.default) {
          return <NoDriftTag />;
        }
        return (
          <Tooltip
            title={`Current common header version on source is ${common_header_version.stored} and default is ${common_header_version.default}`}
          >
            <DriftTag
              current={common_header_version.stored}
              defaultValue={common_header_version.default}
            />
          </Tooltip>
        );
      },
    },
  ];

  if (error) {
    return <NotificationCard type="error" title={error.message} />;
  }
  return (
    <Table
      rowKey="source"
      dataSource={defaultsDriftSources}
      loading={isLoading}
      columns={columns}
    />
  );
};
