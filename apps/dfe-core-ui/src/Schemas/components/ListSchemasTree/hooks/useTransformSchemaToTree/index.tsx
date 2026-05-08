import { SchemaSummary } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';
import { IconStarFilled } from '@repo/dfe-icons';
import { Tooltip, TreeDataNode, Typography } from 'antd';
import { useMemo } from 'react';

const formatSegmentTitle = (segment: string): string => segment;

const buildVersionChildren = (
  schema: NonNullable<SchemaSummary['schemas']>[number],
  setSelectedSchemaPath: (schema_path: string | null) => void,
  setSelectedSchemaVersion: (
    schema_version: string | null,
    schema_path?: string | null,
  ) => void,
): TreeDataNode[] =>
  (schema.versions ?? []).map((version) => ({
    key: `${schema.name}.${version}`,
    title: (
      <Typography.Text
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSchemaVersion(version, schema.name);
        }}
        className="cursor-pointer flex items-center gap-x-2"
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
  setSelectedSchemaPath: (schema_path: string | null) => void,
  setSelectedSchemaVersion: (
    schema_version: string | null,
    schema_path?: string | null,
  ) => void,
): TreeDataNode[] => {
  const out: TreeDataNode[] = [];

  for (const schema of node.schemas ?? []) {
    const versionChildren = buildVersionChildren(
      schema,
      setSelectedSchemaPath,
      setSelectedSchemaVersion,
    );
    out.push({
      key: schema.name,
      title: (
        <Typography.Text
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchemaPath(schema.name);
            setSelectedSchemaVersion(
              schema.current ?? schema.versions?.[0] ?? null,
              schema.name,
            );
          }}
          className="flex items-center overflow-hidden align-middle cursor-pointer gap-x-1 text-ellipsis whitespace-nowrap"
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
      setSelectedSchemaPath,
      setSelectedSchemaVersion,
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
  setSelectedSchemaPath,
  setSelectedSchemaVersion,
}: {
  schemaObjects: SchemaSummary;
  setSelectedSchemaPath: (schema_path: string | null) => void;
  setSelectedSchemaVersion: (
    schema_version: string | null,
    schema_path?: string | null,
  ) => void;
}) =>
  useMemo(
    () =>
      schemaSummaryToTreeData(
        schemaObjects,
        [],
        setSelectedSchemaPath,
        setSelectedSchemaVersion,
      ),
    [schemaObjects, setSelectedSchemaPath, setSelectedSchemaVersion],
  );
