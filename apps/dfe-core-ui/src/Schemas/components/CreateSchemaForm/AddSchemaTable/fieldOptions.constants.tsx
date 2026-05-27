export const ATTRIBUTE_OPTIONS = [
  { label: 'Low cardinality', value: 'lowcardinality' },
  { label: 'Nullable', value: 'nullable' },
  { label: 'Not null', value: 'not_null' },
  { label: 'Materialized', value: 'materialized' },
  { label: 'Alias', value: 'alias' },
];

export const PRIMITIVE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Text', value: 'text' },
  { label: 'Integer', value: 'integer' },
  { label: 'Float', value: 'float' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date Time', value: 'datetime' },
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Date', value: 'date' },
  { label: 'IP', value: 'ip' },
  { label: 'UUID', value: 'uuid' },
  { label: 'JSON', value: 'json' },
  { label: 'Geo Point', value: 'geo_point' },
  { label: 'Enum', value: 'enum' },
];

export const USE_CASE_OPTIONS = [
  { label: 'Dimension', value: 'dimension' },
  { label: 'Fulltext', value: 'fulltext' },
  { label: 'Text Search', value: 'text_search' },
  { label: 'Range', value: 'range' },
  { label: 'Bloom', value: 'bloom' },
];

export const TYPE_OPTIONS_SEMVER_MAP = {
  model: 'Major',
  addition: 'Minor',
  revision: 'Patch',
};
export const TYPE_OPTIONS = [
  {
    label: (
      <p>
        Model
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Major)
        </span>
      </p>
    ),
    value: 'model',
  },
  {
    label: (
      <p>
        Addition
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Minor)
        </span>
      </p>
    ),
    value: 'addition',
  },
  {
    label: (
      <p>
        Revision
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Patch)
        </span>
      </p>
    ),
    value: 'revision',
  },
];
