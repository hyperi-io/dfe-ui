import { Table } from '@/core/components/Table';
import { useBulkActionSources } from '@/core/hooks/useBulkActionSources';
import {
  TBulkActionSourcesRequestBody,
  TBulkActionSourcesResponse,
} from '@/core/hooks/useBulkActionSources/types';
import { AwaitingReviewNote, awaitsReview } from '@/core/utils/sourceReview';
import { App, Button } from 'antd';
import { useState } from 'react';

export const BuildDeployTab = ({
  appliedSources,
  onSuccess,
}: {
  appliedSources: TBulkActionSourcesRequestBody['sources'];
  onSuccess?: (response?: TBulkActionSourcesResponse) => void;
}) => {
  const { notification } = App.useApp();
  const { mutate: bulkActionDeploy, isPending } = useBulkActionSources({
    onSuccess: (response) => {
      const held = response.awaiting_review ?? [];
      if (awaitsReview(response) || held.length > 0) {
        notification.info({
          title: `${held.length} source${held.length === 1 ? '' : 's'} awaiting review`,
          description: (
            <AwaitingReviewNote
              detail={`${held.join(', ')} ${held.length === 1 ? 'is' : 'are'} saved on a review branch. Main is unchanged until the review is merged, so nothing was deployed for ${held.length === 1 ? 'it' : 'them'}.`}
              review={response}
            />
          ),
          placement: 'bottomLeft',
          duration: 0,
        });
      }
      // Nothing moved when every source was held.
      if (held.length > 0 && (response.succeeded ?? []).length === 0) {
        return;
      }
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
