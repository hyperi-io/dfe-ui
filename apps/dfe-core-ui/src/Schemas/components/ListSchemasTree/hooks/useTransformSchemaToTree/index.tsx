import { CloneSchemaModal } from '@/Schemas/components/CloneSchemaModal';
import { DeleteSchemaModal } from '@/Schemas/components/DeleteSchemaModal';
import { TreeInteractiveLabel } from '@/Schemas/components/ListSchemasTree/TreeInteractiveLabel';
import { SchemaSummary } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';
import { IconFile, IconFolder, IconStarFilled } from '@repo/dfe-icons';
import { notification, Tooltip, TreeDataNode } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useMemo } from 'react';

const folderIcon = <IconFolder className="shrink-0" />;
const fileIcon = <IconFile className="shrink-0" />;

/** Ant Design Tree keys must be globally unique; folder and schema paths can share the same string. */
export const folderTreeKey = (pathSegments: string[]) =>
  `dir:${pathSegments.join('.')}`;

export const schemaTreeKey = (schemaPath: string) => `schema:${schemaPath}`;

export const versionTreeKey = (schemaPath: string, version: string) =>
  `${schemaTreeKey(schemaPath)}@${version}`;

/** Folder keys (dot-separated) plus schema key when a version is selected. */
export const getExpandedKeysForSchemaSelection = (
  schemaPath: string | null,
  schemaVersion: string | null,
): string[] => {
  if (!schemaPath) {
    return [];
  }

  const segments = schemaPath.split('/');
  const keys: string[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    keys.push(folderTreeKey(segments.slice(0, i + 1)));
  }

  if (schemaVersion) {
    keys.push(schemaTreeKey(schemaPath));
  }

  return keys;
};

const buildVersionChildren = (
  schema: NonNullable<SchemaSummary['schemas']>[number],
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
                <IconStarFilled className="shrink-0 text-yellow-500" />
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
  node: SchemaSummary;
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

  for (const schema of node.schemas ?? []) {
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
          title={schema.name.split('/').pop() ?? ''}
          onClick={() => {
            expandTreeNode(schemaTreeKey(schema.name));
            setSelectedSchema({
              schema_path: schema.name,
              schema_version: schema.current,
            });
          }}
          selected={
            selectedSchemaPath === schema.name &&
            selectedSchemaVersion === schema.current
          }
          actions={
            <>
              <CloneSchemaModal
                schema={schema.name}
                versions={schema.versions ?? []}
                onSuccess={(schema) =>
                  apiNotification.success({
                    title: 'Schema cloned successfully',
                    description: `${schema.path} has been cloned successfully`,
                    placement: 'bottomLeft',
                  })
                }
              />
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
        />
      ),
      children: nested,
    });
  }

  return out;
};

export const useTransformSchemaToTree = ({
  schemaObjects,
  setSelectedSchema,
  selectedSchemaPath,
  selectedSchemaVersion,
  expandTreeNode,
}: {
  schemaObjects: SchemaSummary;
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
}) => {
  const [apiNotification, notificationContextHolder] =
    notification.useNotification();

  const tree = useMemo(
    () =>
      schemaSummaryToTreeData({
        node: schemaObjects,
        pathSegments: [],
        setSelectedSchema,
        selectedSchemaPath,
        selectedSchemaVersion,
        apiNotification,
        expandTreeNode,
      }),
    [
      schemaObjects,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      apiNotification,
      expandTreeNode,
    ],
  );

  return { tree, notificationContextHolder };
};
