import { cn } from '@/core/utils/style';
import { SchemaSummary } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';
import { IconStarFilled } from '@repo/dfe-icons';
import { Tooltip, TreeDataNode, Typography } from 'antd';
import { useMemo } from 'react';

const selectedTitleClassName =
  'text-tertiary! dark:text-dark-foreground! font-semibold';

const formatSegmentTitle = (segment: string): string => segment;

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
    keys.push(segments.slice(0, i + 1).join('.'));
  }

  if (schemaVersion) {
    keys.push(schemaPath);
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
): TreeDataNode[] =>
  (schema.versions ?? []).map((version) => ({
    key: `${schema.name}.${version}`,
    title: (
      <Typography.Text
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSchema({
            schema_path: schema.name,
            schema_version: version,
          });
        }}
        className={cn(
          'cursor-pointer flex items-center gap-x-2',
          selectedSchemaPath === schema.name &&
            selectedSchemaVersion === version &&
            selectedTitleClassName,
        )}
      >
        {version}
        {version === schema.current ? (
          <Tooltip destroyOnHidden title="Current version">
            <IconStarFilled className="text-yellow-500" />
          </Tooltip>
        ) : null}
      </Typography.Text>
    ),
    isLeaf: true,
  }));

const schemaSummaryToTreeData = (
  node: SchemaSummary,
  pathSegments: string[],
  setSelectedSchema: ({
    schema_path,
    schema_version,
  }: {
    schema_path: string;
    schema_version: string;
  }) => void,
  selectedSchemaPath: string | null,
  selectedSchemaVersion: string | null,
): TreeDataNode[] => {
  const out: TreeDataNode[] = [];

  for (const schema of node.schemas ?? []) {
    const versionChildren = buildVersionChildren(
      schema,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
    );
    out.push({
      key: schema.name,
      title: (
        <Typography.Text
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchema({
              schema_path: schema.name,
              schema_version: schema.current,
            });
          }}
          className={cn(
            'flex items-center overflow-hidden align-middle cursor-pointer gap-x-1 text-ellipsis whitespace-nowrap',
            selectedSchemaPath === schema.name &&
              selectedSchemaVersion === schema.current &&
              selectedTitleClassName,
          )}
        >
          {schema.name.split('/').pop()}
        </Typography.Text>
      ),
      children: versionChildren.length > 0 ? versionChildren : undefined,
      isLeaf: versionChildren.length === 0,
    });
  }

  const childEntries = Object.entries(node.children ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [segment, child] of childEntries) {
    const nextSegments = [...pathSegments, segment];
    const nested = schemaSummaryToTreeData(
      child,
      nextSegments,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
    );

    if (nested.length === 0) {
      continue;
    }

    out.push({
      key: nextSegments.join('.'),
      title: formatSegmentTitle(segment),
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
}) =>
  useMemo(
    () =>
      schemaSummaryToTreeData(
        schemaObjects,
        [],
        setSelectedSchema,
        selectedSchemaPath,
        selectedSchemaVersion,
      ),
    [
      schemaObjects,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
    ],
  );
