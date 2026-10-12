import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useBulkActionSources } from '@/core/hooks/useBulkActionSources';
import {
  TBulkActionSourcesRequestBody,
  TBulkActionSourcesResponse,
} from '@/core/hooks/useBulkActionSources/types';
import { App, Button } from 'antd';
import { useState } from 'react';

export const BuildDeployTab = ({
  appliedSources,
  appliedSuccessMessage,
  onSuccess,
}: {
  appliedSources: TBulkActionSourcesRequestBody['sources'];
  appliedSuccessMessage: string;
  onSuccess?: (response?: TBulkActionSourcesResponse) => void;
}) => {
  const { notification } = App.useApp();
  const { mutate: bulkActionDeploy, isPending } = useBulkActionSources({
    onSuccess: (response) => {
      notification.success({
        title: 'Deployments successfully queued',
        placement: 'bottomLeft',
      });
      onSuccess?.(response);
    },
    onError: (error) => {
      notification.error({
        title: error.message,
        placement: 'bottomLeft',
      });
    },
  });
  const [selectedSources, setSelectedSources] = useState<
    TBulkActionSourcesRequestBody['sources']
  >([]);
  const columns = [
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'Version to Apply',
      dataIndex: 'version',
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <NotificationCard title={appliedSuccessMessage} type="success" />
      <Table<TBulkActionSourcesRequestBody['sources'][number]>
        rowKey="source"
        dataSource={appliedSources}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedSources.map((source) => source.source),
          preserveSelectedRowKeys: true,
          onChange: (keys) => {
            const selectedKeys = new Set(keys.map(String));
            setSelectedSources(
              appliedSources.filter((source) =>
                selectedKeys.has(source.source),
              ),
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
          onClick={() =>
            bulkActionDeploy({
              sources: selectedSources,
              dry_run: false,
              action: 'deploy',
            })
          }
        >
          Update Configurations
        </Button>
      </div>
    </div>
  );
};
