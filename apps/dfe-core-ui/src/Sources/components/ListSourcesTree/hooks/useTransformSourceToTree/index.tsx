import { CloneSourceModal } from '@/Sources/components/CloneSourceModal';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { TreeInteractiveLabel } from '@/Sources/components/ListSourcesTree/TreeInteractiveLabel';
import type { SourceSummary } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { IconFile } from '@repo/dfe-icons';
import { notification, TreeDataNode } from 'antd';
import { useMemo } from 'react';

const fileIcon = <IconFile className="shrink-0" />;

export const sourceTreeKey = (sourceName: string) => `source:${sourceName}`;

const sourceListLabel = (sourceDetail: SourceSummary) => {
  const { display_name, source } = sourceDetail;
  const displayName = display_name?.trim();
  if (displayName) {
    return (
      <>
        {displayName}
        <span className="ml-2 bg-background-muted dark:bg-dark-background-muted font-normal rounded-full px-2 py-0.5 text-xs text-foreground/50 dark:text-dark-foreground/50">
          {source}
        </span>
      </>
    );
  }
  return source;
};

const sourcesToTreeData = ({
  sources,
  setSelectedSourceName,
  selectedSourceName,
  refetchSources,
  onCloneSuccess,
  onDeleteSuccess,
}: {
  sources: SourceSummary[];
  setSelectedSourceName: (source: string | null) => void;
  selectedSourceName: string | null;
  refetchSources: () => void;
  onCloneSuccess: (sourceName: string) => void;
  onDeleteSuccess: (sourceName: string) => void;
}): TreeDataNode[] =>
  sources.map((source) => ({
    key: sourceTreeKey(source.source),
    title: (
      <TreeInteractiveLabel
        icon={fileIcon}
        title={sourceListLabel(source)}
        onClick={() => {
          setSelectedSourceName(source.source);
        }}
        selected={selectedSourceName === source.source}
        actions={
          <>
            <CloneSourceModal
              source={source}
              onSuccess={({ source: newSource }) => {
                setSelectedSourceName(newSource);
                refetchSources();
                onCloneSuccess(newSource);
              }}
            />
            <DeleteSourceModal
              source={source.source}
              onSuccess={() => {
                setSelectedSourceName(null);
                refetchSources();
                onDeleteSuccess(source.source);
              }}
            />
          </>
        }
      />
    ),
    isLeaf: true,
  }));

export const useTransformSourceToTree = ({
  sources,
  setSelectedSourceName,
  selectedSourceName,
  refetchSources,
}: {
  sources: SourceSummary[];
  setSelectedSourceName: (source: string | null) => void;
  selectedSourceName: string | null;
  refetchSources: () => void;
}) => {
  const [apiNotification, notificationContextHolder] =
    notification.useNotification();

  const tree = useMemo(
    () =>
      sourcesToTreeData({
        sources,
        setSelectedSourceName,
        selectedSourceName,
        refetchSources,
        onCloneSuccess: (sourceName) =>
          apiNotification.success({
            title: 'Source cloned successfully',
            description: `${sourceName} has been cloned successfully`,
            placement: 'bottomLeft',
          }),
        onDeleteSuccess: (sourceName) =>
          apiNotification.success({
            title: 'Source deleted successfully',
            description: `${sourceName} has been deleted successfully`,
            placement: 'bottomLeft',
          }),
      }),
    [
      sources,
      setSelectedSourceName,
      selectedSourceName,
      refetchSources,
      apiNotification,
    ],
  );

  return { tree, notificationContextHolder };
};
