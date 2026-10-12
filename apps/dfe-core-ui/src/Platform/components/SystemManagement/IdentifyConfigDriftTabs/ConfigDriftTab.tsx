import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { useApplyDefaults } from '@/Platform/hooks/system/useApplyDefaults';
import { TApplyDefaultsResponse } from '@/Platform/hooks/system/useApplyDefaults/types';
import { TDefaultsDriftSourceItem } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources/types';
import { Button, Tag } from 'antd';
import { useState } from 'react';

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
  const isDrifted = current?.toString() !== defaultValue?.toString();
  if (!isDrifted) {
    return <NoDriftTag />;
  }
  return (
    <span className="flex items-center gap-2">
      <Tag color="warning">Drift</Tag>
      Current: {current?.toString().replace('common-header/', '')} | Default:{' '}
      {defaultValue?.toString().replace('common-header/', '')}
    </span>
  );
};

export const ConfigDriftTab = ({
  onSuccess,
  defaultsDriftSources,
}: {
  onSuccess?: (response: TApplyDefaultsResponse) => void;
  defaultsDriftSources: TDefaultsDriftSourceItem[];
}) => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const {
    mutate: applyDefaults,
    isPending,
    error: applyError,
  } = useApplyDefaults({
    onSuccess: (response) => {
      setSelectedSources([]);
      onSuccess?.(response);
    },
  });

  const columns = [
    {
      title: 'Source',
      dataIndex: 'source',
      render: (source: string, record: TDefaultsDriftSourceItem) => {
        if (!record.core) {
          return source;
        }

        return (
          <span className="flex items-center gap-2">
            {source}
            <Tooltip title="Engine-owned sources cannot have defaults applied">
              <Tag>Core</Tag>
            </Tooltip>
          </span>
        );
      },
    },
    {
      title: 'TTL Days',
      dataIndex: 'ttl_days',
      render: (ttl_days: {
        stored: string | number | null;
        default: string | number | null;
      }) => {
        return (
          <DriftTag current={ttl_days.stored} defaultValue={ttl_days.default} />
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
        return (
          <DriftTag current={engine.stored} defaultValue={engine.default} />
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
        return (
          <DriftTag
            current={common_header_type.stored}
            defaultValue={common_header_type.default}
          />
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
        return (
          <DriftTag
            current={common_header_version.stored}
            defaultValue={common_header_version.default}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Table<TDefaultsDriftSourceItem>
        rowKey="source"
        dataSource={defaultsDriftSources}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedSources,
          preserveSelectedRowKeys: true,
          getCheckboxProps: (record) => ({ disabled: record.core }),
          onChange: (keys) => {
            const coreSources = new Set(
              (defaultsDriftSources ?? [])
                .filter((item) => item.core)
                .map((item) => item.source),
            );
            setSelectedSources(
              keys.map(String).filter((key) => !coreSources.has(key)),
            );
          },
        }}
      />
      {applyError && (
        <NotificationCard type="error" title={applyError?.message} />
      )}
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-foreground/50 dark:text-foreground/50">
          {selectedSources.length} selected
        </span>
        <Button
          type="primary"
          loading={isPending}
          disabled={selectedSources.length === 0}
          onClick={() => applyDefaults({ sources: selectedSources })}
        >
          Update Configurations
        </Button>
      </div>
    </div>
  );
};
