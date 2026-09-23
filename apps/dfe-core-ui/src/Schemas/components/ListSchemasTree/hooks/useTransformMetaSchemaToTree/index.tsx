import { CloneSchemaModal } from '@/Schemas/components/CloneSchemaModal';
import { DeleteSchemaModal } from '@/Schemas/components/DeleteSchemaModal';
import { DeleteSchemaVersionModal } from '@/Schemas/components/DeleteSchemaVersionModal';
import { TreeInteractiveLabel } from '@/Schemas/components/ListSchemasTree/TreeInteractiveLabel';
import { Tooltip } from '@/core/components/Tooltip';
import { resourceTypeIconSwitch } from '@/core/constants/resourceType.constants';
import { TSchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { IconFile, IconFolder, IconStarFilled } from '@repo/dfe-icons';
import { notification, TreeDataNode } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useMemo } from 'react';

const folderIcon = <IconFolder className="shrink-0" />;
const fileIcon = <IconFile className="shrink-0" />;
/** Stable default so useMemo does not invalidate when the prop is omitted. */
const EMPTY_PATH_SEGMENTS: string[] = [];

/** Ant Design Tree keys must be globally unique; folder and schema paths can share the same string. */
export const folderTreeKey = (pathSegments: string[]) =>
  `dir:${pathSegments.join('.')}`;

export const schemaTreeKey = (schemaPath: string) => `schema:${schemaPath}`;

export const versionTreeKey = (schemaPath: string, version: string) =>
  `${schemaTreeKey(schemaPath)}@${version}`;

/** True when the selected schema lives in this folder or is nested under it. */
export const isSchemaPathUnderFolder = (
  selectedSchemaPath: string | null,
  folderSegments: string[],
) => {
  if (!selectedSchemaPath || folderSegments.length === 0) {
    return false;
  }
  const folderPath = folderSegments.join('/');
  return (
    selectedSchemaPath === folderPath ||
    selectedSchemaPath.startsWith(`${folderPath}/`)
  );
};

const buildVersionChildren = (
  schema: NonNullable<TSchemaListResponse['objects']['items']>[number],
  setSelectedSchema: ({
    schema_path,
    schema_version,
  }: {
    schema_path: string;
    schema_version: string;
  }) => void,
  selectedSchemaPath: string | null,
  selectedSchemaVersion: string | null,
  expandTreeNode: (key: string) => void,
): TreeDataNode[] =>
  (schema.versions ?? []).map((version) => ({
    key: versionTreeKey(schema.name, version),
    title: (
      <TreeInteractiveLabel
        title={
          <>
            <span className="min-w-0 truncate">{version}</span>
            {version === schema.current && (
              <Tooltip destroyOnHidden title="Current version">
                <IconStarFilled className="text-yellow-500 shrink-0" />
              </Tooltip>
            )}
          </>
        }
        onClick={() => {
          expandTreeNode(schemaTreeKey(schema.name));
          setSelectedSchema({
            schema_path: schema.name,
            schema_version: version,
          });
        }}
        selected={
          selectedSchemaPath === schema.name &&
          selectedSchemaVersion === version
        }
        actions={
          schema.resource_type !== 'core' ? (
            <DeleteSchemaVersionModal
              schemaPath={`${schema.name}`}
              version={version}
            />
          ) : undefined
        }
      />
    ),
    isLeaf: true,
  }));

const schemaSummaryToTreeData = ({
  node,
  pathSegments,
  setSelectedSchema,
  selectedSchemaPath,
  selectedSchemaVersion,
  apiNotification,
  expandTreeNode,
}: {
  node: TSchemaListResponse['objects'];
  pathSegments: string[];
  setSelectedSchema: ({
    schema_path,
    schema_version,
  }: {
    schema_path: string;
    schema_version: string;
  }) => void;
  selectedSchemaPath: string | null;
  selectedSchemaVersion: string | null;
  apiNotification: NotificationInstance;
  expandTreeNode: (key: string) => void;
}): TreeDataNode[] => {
  const out: TreeDataNode[] = [];

  for (const schema of node.items ?? []) {
    const versionChildren = buildVersionChildren(
      schema,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      expandTreeNode,
    );
    const schemaIsLeaf = versionChildren.length === 0;
    out.push({
      key: schemaTreeKey(schema.name),
      title: (
        <TreeInteractiveLabel
          icon={fileIcon}
          title={
            <span className="flex items-center gap-x-1">
              <span className="min-w-0 truncate">
                {schema.name.split('/').pop() ?? ''}
              </span>
              <span className="opacity-50">
                {resourceTypeIconSwitch(schema.resource_type)}
              </span>
            </span>
          }
          onClick={() => {
            expandTreeNode(schemaTreeKey(schema.name));
            setSelectedSchema({
              schema_path: schema.name,
              schema_version: schema.current,
            });
          }}
          selected={selectedSchemaPath === schema.name}
          actions={
            <>
              <CloneSchemaModal
                schema={schema}
                versions={schema.versions ?? []}
                onSuccess={(schema) =>
                  apiNotification.success({
                    title: 'Schema cloned successfully',
                    description: `${schema.path} has been cloned successfully`,
                    placement: 'bottomLeft',
                  })
                }
              />
              {schema.resource_type !== 'core' && (
                <DeleteSchemaModal
                  schemaPath={`${schema.name}`}
                  onSuccess={(schemaPath) =>
                    apiNotification.success({
                      title: 'Schema deleted successfully',
                      description: `${schemaPath} has been deleted successfully`,
                      placement: 'bottomLeft',
                    })
                  }
                />
              )}
            </>
          }
        />
      ),
      children: versionChildren.length > 0 ? versionChildren : undefined,
      isLeaf: schemaIsLeaf,
    });
  }

  const childEntries = Object.entries(node.children ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [segment, child] of childEntries) {
    const nextSegments = [...pathSegments, segment];
    const nested = schemaSummaryToTreeData({
      node: child,
      pathSegments: nextSegments,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      apiNotification,
      expandTreeNode,
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
          selected={isSchemaPathUnderFolder(selectedSchemaPath, nextSegments)}
        />
      ),
      children: nested,
    });
  }

  return out;
};

export const useTransformMetaSchemaToTree = ({
  schemaObjects,
  setSelectedSchema,
  selectedSchemaPath,
  selectedSchemaVersion,
  expandTreeNode,
  rootPathSegments = EMPTY_PATH_SEGMENTS,
}: {
  schemaObjects: TSchemaListResponse['objects'];
  setSelectedSchema: ({
    schema_path,
    schema_version,
  }: {
    schema_path: string;
    schema_version: string;
  }) => void;
  selectedSchemaPath: string | null;
  selectedSchemaVersion: string | null;
  expandTreeNode: (key: string) => void;
  /** Prefix for folder keys when the tree is rooted below the full schema path (e.g. meta-only view). */
  rootPathSegments?: string[];
}) => {
  const [apiNotification, notificationContextHolder] =
    notification.useNotification();

  const tree = useMemo(
    () =>
      schemaSummaryToTreeData({
        node: schemaObjects,
        pathSegments: rootPathSegments,
        setSelectedSchema,
        selectedSchemaPath,
        selectedSchemaVersion,
        apiNotification,
        expandTreeNode,
      }),
    [
      schemaObjects,
      rootPathSegments,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      apiNotification,
      expandTreeNode,
    ],
  );

  return { tree, notificationContextHolder };
};
