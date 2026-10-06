import { CloneSourceDrawer } from '@/Sources/components/CloneSourceDrawer';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { TreeInteractiveLabel } from '@/Sources/components/ListSourcesTree/TreeInteractiveLabel';
import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { Tooltip } from '@/core/components/Tooltip';
import { TSourceSummary } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { cn } from '@/core/utils/style';
import {
  IconBucket,
  IconBucketDroplet,
  IconCapture,
  IconCaptureOff,
  IconFile,
  IconFolder,
  IconLock,
  IconRocket,
  IconStarFilled,
} from '@repo/dfe-icons';
import { Button, notification, Tag, TreeDataNode } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useMemo } from 'react';

const folderIcon = <IconFolder className="shrink-0" />;
const fileIcon = <IconFile className="shrink-0" />;

const originTagColour = (origin: string) => {
  switch (origin) {
    case 'fetcher':
      return 'purple';
    case 'receiver':
      return 'blue';
    default:
      return 'default';
  }
};

/** Ant Design Tree keys must be globally unique; folder and source paths can share the same string. */
export const folderTreeKey = (pathSegments: string[]) =>
  `dir:${pathSegments.join('.')}`;

export const sourceTreeKey = (sourcePath: string) => `source:${sourcePath}`;

/** The full path, not the leaf, so two sources of the same name in different folders stay distinct. */
export const sourceTreeTestId = (sourcePath: string) =>
  `source-tree-item-${sourcePath}`;

export const versionTreeKey = (sourcePath: string, version: string) =>
  `${sourceTreeKey(sourcePath)}@${version}`;

const buildVersionChildren = (
  source: NonNullable<TSourceSummary['items']>[number],
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
): TreeDataNode[] => {
  const displayVersion = (version: string) => {
    return version === source.deployed_version || version === source.current;
  };
  const versionStateLabel = (version: string) => {
    if (version === source.current && version === source.deployed_version) {
      return 'Current Deployed';
    }
    if (version === source.current) {
      return 'Working Copy';
    }
    if (version === source.deployed_version) {
      return 'Deployed';
    }

    return null;
  };
  return (source.versions ?? []).filter(displayVersion).map((version) => ({
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
            {/* A truncated state label reads as a spinner ("Working ..."), so it is a tag and never ellipsised. */}
            {versionStateLabel(version) ? (
              <Tag className="m-0 shrink-0 whitespace-nowrap">
                {versionStateLabel(version)}
              </Tag>
            ) : (
              <span className="min-w-0 truncate">{version}</span>
            )}
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
};

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
  node: TSourceSummary;
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

  const mainSource =
    node.items?.find((source) => source.name == 'main') ?? null;

  const nodeItems = node.items?.filter((source) => source.name != 'main') ?? [];

  if (mainSource) {
    // Push custom main first
    out.push({
      key: sourceTreeKey(mainSource.name),
      title: () => {
        const isDeployed = mainSource.deployed_version;
        return (
          <TreeInteractiveLabel
            icon={<IconLock className="shrink-0" />}
            title={
              <span className="flex gap-2 items-center">
                {mainSource.name.split('/').pop() ?? ''}
                <Tooltip destroyOnHidden title="Lands in the shared table">
                  <IconBucket className="opacity-80" />
                </Tooltip>

                {isDeployed && (
                  <Tooltip destroyOnHidden title="Is deployed">
                    <IconRocket className="text-tertiary opacity-80" />
                  </Tooltip>
                )}
              </span>
            }
            onClick={() => {
              expandTreeNode(sourceTreeKey(mainSource.name));
              setSelectedSource({
                source_name: mainSource.name,
                source_version: mainSource.current,
              });
            }}
            selected={selectedSourceName === mainSource.name}
            actions={
              <>
                <Tooltip
                  destroyOnHidden
                  title={
                    mainSource.enabled
                      ? 'Source is enabled'
                      : 'Source is disabled'
                  }
                  placement="right"
                >
                  <Button
                    type="default"
                    shape="circle"
                    size="small"
                    className={cn(
                      'p-0.5',
                      mainSource.enabled
                        ? 'text-success border-success bg-background dark:bg-dark-background'
                        : 'text-gray-500 border-gray-500 bg-background-muted dark:bg-dark-background-muted',
                    )}
                    icon={
                      mainSource.enabled ? <IconCapture /> : <IconCaptureOff />
                    }
                  />
                </Tooltip>
              </>
            }
          />
        );
      },
      children: undefined,
      isLeaf: true,
    });
  }

  for (const source of nodeItems ?? []) {
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
        const isSharedTable = source.current_table_topic_type === 'main';
        return (
          <TreeInteractiveLabel
            icon={fileIcon}
            title={
              /* The row carries badges beside the name, so its text is not a stable locator; address it by the full source path. */
              <span
                className="flex gap-2 items-center min-w-0"
                data-testid={sourceTreeTestId(source.name)}
              >
                {/* The badges hold their width, so the name is the only thing
                    that can give: without this it hyphenates mid-word at laptop
                    width instead of ellipsising. */}
                <span className="min-w-0 truncate">
                  {source.name.split('/').pop() ?? ''}
                </span>

                {source.origin && (
                  <Tag
                    className="m-0 shrink-0"
                    color={originTagColour(source.origin)}
                  >
                    {source.origin}
                  </Tag>
                )}

                {isSharedTable && (
                  <Tooltip destroyOnHidden title="Lands in the shared table">
                    <IconBucket className="opacity-80 shrink-0" />
                  </Tooltip>
                )}

                {!isDeployed && !isSharedTable && (
                  <Tooltip
                    destroyOnHidden
                    title="Shared table will be used until source is deployed"
                  >
                    <IconBucketDroplet className="opacity-80 shrink-0" />
                  </Tooltip>
                )}
                {isDeployed && (
                  <Tooltip destroyOnHidden title="Is deployed">
                    <IconRocket className="text-tertiary opacity-80 shrink-0" />
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
            selected={selectedSourceName === source.name}
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
                <CloneSourceDrawer
                  sourceName={source.name}
                  sourceVersion={source.current}
                />
                {source.resource_type !== RESOURCE_TYPES.CORE && (
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
                )}
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
  sourceObjects: TSourceSummary;
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
