import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { useApplyDefaults } from '@/Platform/hooks/system/useApplyDefaults';
import { useFetchInfiniteDefaultsDriftSources } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources';
import { TDefaultsDriftSourceItem } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources/types';
import { App, Button, Tag } from 'antd';
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
const appliedDefaultsMessage = (updated: string[], unchanged: string[]) => {
  if (updated.length === 0) {
    return 'Selected sources already match the defaults';
  }

  const updatedLabel = `Applied defaults to ${updated.length} source${updated.length === 1 ? '' : 's'}`;
  if (unchanged.length === 0) {
    return updatedLabel;
  }

  return `${updatedLabel}. ${unchanged.length} already matched`;
};

export const ApplyDefaultsContent = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const { notification } = App.useApp();
  const {
    data: { items: defaultsDriftSources } = {},
    isLoading,
    error,
  } = useFetchInfiniteDefaultsDriftSources();
  const {
    mutate: applyDefaults,
    isPending,
    error: applyError,
  } = useApplyDefaults({
    onSuccess: ({ updated, unchanged }) => {
      setSelectedSources([]);
      notification.success({
        title: appliedDefaultsMessage(updated, unchanged),
        placement: 'bottomLeft',
      });
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

  if (error) {
    return <NotificationCard type="error" title={error.message} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ApiErrorNotification error={applyError} />
      <Table<TDefaultsDriftSourceItem>
        rowKey="source"
        dataSource={defaultsDriftSources}
        loading={isLoading}
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
          Apply Defaults
        </Button>
      </div>
    </div>
  );
};
