'use client';

import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { ArtifactLabels } from '@/Library/components/ArtifactLabels';
import { ArtifactTags } from '@/Library/components/ArtifactTags';
import { ArtifactUsage } from '@/Library/components/ArtifactUsage';
import { ArtifactVersions } from '@/Library/components/ArtifactVersions';
import { useDeleteLibraryArtifact } from '@/Library/hooks/useDeleteLibraryArtifact';
import { useFetchLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail';
import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconTrash } from '@repo/dfe-icons';
import { Button, Spin, Tabs } from 'antd';

/** One artefact: its versions, its tags, its labels and who uses it. */
export const ArtifactDetailDrawer = ({
  artifact,
  onClose,
}: {
  artifact: string | null;
  onClose: () => void;
}) => {
  const { data, isLoading, error } = useFetchLibraryArtifactDetail({
    artifact: artifact ?? '',
    queryEnabled: artifact !== null,
  });
  const {
    data: deleteResult,
    mutate: deleteArtifact,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteLibraryArtifact({
    artifact: artifact ?? '',
    onSuccess: onClose,
  });

  const deleteMessage =
    getApiErrorResponseBody(deleteError)?.message ?? deleteError?.message;

  return (
    <Drawer
      title={artifact ?? ''}
      open={artifact !== null}
      size="60%"
      onClose={onClose}
    >
      {isLoading && <Spin />}
      {error && (
        <NotificationCard
          type="error"
          title="Could not read the artefact"
          description={error.message}
        />
      )}
      {data && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
              {`${data.kind} - ${data.state}${data.group ? ` - ${data.group}` : ''}`}
            </p>
            <RbacProtected action={RbacProtected.rbacActions.library_write}>
              <RbacProtected.Unrestricted>
                <Button
                  size="small"
                  danger
                  icon={<IconTrash />}
                  loading={isDeleting}
                  onClick={() => deleteArtifact()}
                >
                  Delete
                </Button>
              </RbacProtected.Unrestricted>
            </RbacProtected>
          </div>

          {deleteMessage && (
            <NotificationCard
              type="error"
              title="Delete refused"
              description={deleteMessage}
            />
          )}
          {deleteResult && <WriteResultFeedback result={deleteResult} />}

          <Tabs
            items={[
              {
                key: 'versions',
                label: 'Versions',
                children: <ArtifactVersions artifact={data} />,
              },
              {
                key: 'tags',
                label: 'Tags',
                children: <ArtifactTags artifact={data} />,
              },
              {
                key: 'labels',
                label: 'Labels',
                children: <ArtifactLabels artifact={data} />,
              },
              {
                key: 'usage',
                label: 'Usage',
                children: <ArtifactUsage artifact={data.name} />,
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  );
};
