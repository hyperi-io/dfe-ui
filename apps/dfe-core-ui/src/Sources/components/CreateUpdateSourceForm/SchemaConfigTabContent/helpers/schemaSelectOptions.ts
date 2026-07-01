import { components } from '@repo/dfe-engine-types';
import type { SelectProps } from 'antd';

type SchemaSummaryObject = components['schemas']['SchemaSummaryObject'];
export type SchemaSelectOption = NonNullable<SelectProps['options']>[number];

type TreeBuilderNode = {
  subfolders: Map<string, TreeBuilderNode>;
  schemas: SchemaSummaryObject[];
};

const createBuilderNode = (): TreeBuilderNode => ({
  subfolders: new Map(),
  schemas: [],
});

const getOrCreateSubfolder = (
  parent: TreeBuilderNode,
  segment: string,
): TreeBuilderNode => {
  let child = parent.subfolders.get(segment);
  if (!child) {
    child = createBuilderNode();
    parent.subfolders.set(segment, child);
  }
  return child;
};

const addSchemaToBuilder = (
  root: TreeBuilderNode,
  schema: SchemaSummaryObject,
) => {
  const segments = schema.name.split('/').filter(Boolean);
  if (segments.length === 0) {
    return;
  }

  let node = root;
  for (let i = 0; i < segments.length - 1; i++) {
    node = getOrCreateSubfolder(node, segments[i]);
  }
  node.schemas.push(schema);
};

const schemaToOption = (schema: SchemaSummaryObject): SchemaSelectOption => ({
  label: schema.name.split('/').pop() ?? schema.name,
  value: schema.name,
});

/** Directory prefix including trailing slash, e.g. `test/` for `test/test`. */
export const getSchemaPathPrefix = (fullPath: string): string => {
  const lastSlash = fullPath.lastIndexOf('/');
  if (lastSlash === -1) {
    return '';
  }
  return `${fullPath.slice(0, lastSlash + 1)}`;
};

export const getSchemaLeafName = (fullPath: string): string =>
  fullPath.split('/').pop() ?? fullPath;

const builderToGroupedSelectOptions = (
  node: TreeBuilderNode,
  pathSegments: string[],
): SchemaSelectOption[] => {
  const options: SchemaSelectOption[] = [];

  const folderEntries = [...node.subfolders.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [segment, child] of folderEntries) {
    options.push(
      ...builderToGroupedSelectOptions(child, [...pathSegments, segment]),
    );
  }

  const schemaEntries = [...node.schemas].sort((a, b) => {
    const leafA = a.name.split('/').pop() ?? a.name;
    const leafB = b.name.split('/').pop() ?? b.name;
    return leafA.localeCompare(leafB);
  });

  if (schemaEntries.length === 0) {
    return options;
  }

  const schemaOptions = schemaEntries.map(schemaToOption);

  if (pathSegments.length === 0) {
    return [...options, ...schemaOptions];
  }

  options.push({
    label: pathSegments.join('/'),
    options: schemaOptions,
  });

  return options;
};

/** Groups flat schema summaries into Select option groups (non-selectable labels). */
export const schemasToGroupedSelectOptions = (
  schemas: SchemaSummaryObject[],
): SchemaSelectOption[] => {
  const root = createBuilderNode();

  for (const schema of schemas) {
    addSchemaToBuilder(root, schema);
  }

  return builderToGroupedSelectOptions(root, []).sort((a, b) => {
    const labelA = typeof a.label === 'string' ? a.label : '';
    const labelB = typeof b.label === 'string' ? b.label : '';
    return labelA.localeCompare(labelB);
  });
};

export const isSelectableSchemaOptionValue = (value: string) =>
  value !== '__loading__';

/** Version keys from a create/update meta-schema response for the version Select. */
export const versionsFromMetaSchemaOutput = (
  response: Pick<components['schemas']['MetaSchema'], 'current' | 'versions'>,
): string[] => {
  const keys = Object.keys(response.versions ?? {});
  if (keys.length > 0) {
    return keys;
  }
  return response.current ? [response.current] : [];
};
