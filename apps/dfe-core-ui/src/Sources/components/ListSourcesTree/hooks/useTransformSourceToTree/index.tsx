import { CloneSourceModal } from '@/Sources/components/CloneSourceModal';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { TreeInteractiveLabel } from '@/Sources/components/ListSourcesTree/TreeInteractiveLabel';
import { SourceListResponse } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { cn } from '@/core/utils/style';
import {
  IconBucket,
  IconCapture,
  IconCaptureOff,
  IconFile,
  IconFolder,
  IconRocket,
  IconStarFilled,
} from '@repo/dfe-icons';
import { Button, notification, Tooltip, TreeDataNode } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useMemo } from 'react';

const folderIcon = <IconFolder className="shrink-0" />;
const fileIcon = <IconFile className="shrink-0" />;

/** Ant Design Tree keys must be globally unique; folder and source paths can share the same string. */
export const folderTreeKey = (pathSegments: string[]) =>
  `dir:${pathSegments.join('.')}`;

export const sourceTreeKey = (sourcePath: string) => `source:${sourcePath}`;

export const versionTreeKey = (sourcePath: string, version: string) =>
  `${sourceTreeKey(sourcePath)}@${version}`;

/** Folder keys (dot-separated) plus source key when a version is selected. */
export const getExpandedKeysForSourceSelection = (
  sourcePath: string | null,
  sourceVersion: string | null,
): string[] => {
  if (!sourcePath) {
    return [];
  }

  const segments = sourcePath.split('/');
  const keys: string[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    keys.push(folderTreeKey(segments.slice(0, i + 1)));
  }

  if (sourceVersion) {
    keys.push(sourceTreeKey(sourcePath));
  }

  return keys;
};

const buildVersionChildren = (
  source: NonNullable<SourceListResponse['objects']['items']>[number],
  setSelectedSource: ({
    source_name,
    source_version,
  }: {
    source_name: string;
    source_version: string;
  }) => void,
  selectedSourcePath: string | null,
  selectedSourceVersion: string | null,
  expandTreeNode: (key: string) => void,
): TreeDataNode[] =>
  (source.versions ?? []).map((version) => ({
    key: versionTreeKey(source.name, version),
    title: (
      <TreeInteractiveLabel
        title={
          <>
            {version === source.deployed_version && (
              <Tooltip destroyOnHidden title="Deployed version">
                <IconRocket className="text-tertiary shrink-0 absolute top-2 -left-5.5" />
              </Tooltip>
            )}
            <span className="min-w-0 truncate">{version}</span>
            {version === source.current && (
              <Tooltip destroyOnHidden title="Current version">
                <IconStarFilled className="text-yellow-500 shrink-0" />
              </Tooltip>
            )}
          </>
        }
        onClick={() => {
          expandTreeNode(sourceTreeKey(source.name));
          setSelectedSource({
            source_name: source.name,
            source_version: version,
          });
        }}
        selected={
          selectedSourcePath === source.name &&
          selectedSourceVersion === version
        }
      />
    ),
    isLeaf: true,
  }));

const sourceSummaryToTreeData = ({
  node,
  pathSegments,
  setSelectedSource,
  selectedSourceName,
  selectedSourceVersion,
  apiNotification,
  expandTreeNode,
  refetchSources,
}: {
  node: SourceListResponse['objects'];
  pathSegments: string[];
  setSelectedSource: ({
    source_name,
    source_version,
  }: {
    source_name: string;
    source_version: string;
  }) => void;
  selectedSourceName: string | null;
  selectedSourceVersion: string | null;
  apiNotification: NotificationInstance;
  expandTreeNode: (key: string) => void;
  refetchSources: () => void;
}): TreeDataNode[] => {
  const out: TreeDataNode[] = [];

  for (const source of node.items ?? []) {
    const versionChildren = buildVersionChildren(
      source,
      setSelectedSource,
      selectedSourceName,
      selectedSourceVersion,
      expandTreeNode,
    );
    const sourceIsLeaf = versionChildren.length === 0;
    out.push({
      key: sourceTreeKey(source.name),
      title: () => {
        const isDeployed = source.deployed_version;
        return (
          <TreeInteractiveLabel
            icon={fileIcon}
            title={
              <span className="flex gap-2 items-center">
                {source.name.split('/').pop() ?? ''}

                {!isDeployed && (
                  <Tooltip destroyOnHidden title="_default_land">
                    <IconBucket className="opacity-80" />
                  </Tooltip>
                )}
                {isDeployed && (
                  <Tooltip destroyOnHidden title="Is deployed">
                    <IconRocket className="text-tertiary opacity-80" />
                  </Tooltip>
                )}
              </span>
            }
            onClick={() => {
              expandTreeNode(sourceTreeKey(source.name));
              setSelectedSource({
                source_name: source.name,
                source_version: source.current,
              });
            }}
            selected={
              selectedSourceName === source.name &&
              selectedSourceVersion === source.current
            }
            actions={
              <>
                <Tooltip
                  destroyOnHidden
                  title={
                    source.enabled ? 'Source is enabled' : 'Source is disabled'
                  }
                  placement="right"
                >
                  <Button
                    type="default"
                    shape="circle"
                    size="small"
                    className={cn(
                      'p-0.5',
                      source.enabled
                        ? 'text-success border-success bg-background dark:bg-dark-background'
                        : 'text-gray-500 border-gray-500 bg-background-muted dark:bg-dark-background-muted',
                    )}
                    icon={source.enabled ? <IconCapture /> : <IconCaptureOff />}
                  />
                </Tooltip>
              </>
            }
            hoverActions={
              <>
                <CloneSourceModal
                  name={source.name}
                  display_name={source.display_name}
                  enabled={source.enabled}
                  versions={source.versions ?? []}
                  onSuccess={(source) => {
                    void refetchSources();
                    apiNotification.success({
                      title: 'Source cloned successfully',
                      description: `${source.source} has been cloned successfully`,
                      placement: 'bottomLeft',
                    });
                  }}
                />
                <DeleteSourceModal
                  source={`${source.name}`}
                  onSuccess={() =>
                    apiNotification.success({
                      title: 'Source deleted successfully',
                      description: `${source.name} has been deleted successfully`,
                      placement: 'bottomLeft',
                    })
                  }
                />
              </>
            }
          />
        );
      },
      children: versionChildren.length > 0 ? versionChildren : undefined,
      isLeaf: sourceIsLeaf,
    });
  }

  const childEntries = Object.entries(node.children ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [segment, child] of childEntries) {
    const nextSegments = [...pathSegments, segment];
    const nested = sourceSummaryToTreeData({
      node: child,
      pathSegments: nextSegments,
      setSelectedSource,
      selectedSourceName,
      selectedSourceVersion,
      apiNotification,
      expandTreeNode,
      refetchSources,
    });

    if (nested.length === 0) {
      continue;
    }

    const folderKey = folderTreeKey(nextSegments);
    out.push({
      key: folderKey,
      title: (
        <TreeInteractiveLabel
          icon={folderIcon}
          title={segment}
          onClick={() => expandTreeNode(folderKey)}
        />
      ),
      children: nested,
    });
  }

  return out;
};

export const useTransformSourceToTree = ({
  sourceObjects,
  setSelectedSource,
  selectedSourceName,
  selectedSourceVersion,
  expandTreeNode,
  refetchSources,
}: {
  sourceObjects: SourceListResponse['objects'];
  setSelectedSource: ({
    source_name,
    source_version,
  }: {
    source_name: string;
    source_version: string;
  }) => void;
  selectedSourceName: string | null;
  selectedSourceVersion: string | null;
  expandTreeNode: (key: string) => void;
  refetchSources: () => void;
}) => {
  const [apiNotification, notificationContextHolder] =
    notification.useNotification();

  const tree = useMemo(
    () =>
      sourceSummaryToTreeData({
        node: sourceObjects,
        pathSegments: [],
        setSelectedSource,
        selectedSourceName,
        selectedSourceVersion,
        apiNotification,
        expandTreeNode,
        refetchSources,
      }),
    [
      sourceObjects,
      setSelectedSource,
      selectedSourceName,
      selectedSourceVersion,
      apiNotification,
      expandTreeNode,
      refetchSources,
    ],
  );

  return { tree, notificationContextHolder };
};
