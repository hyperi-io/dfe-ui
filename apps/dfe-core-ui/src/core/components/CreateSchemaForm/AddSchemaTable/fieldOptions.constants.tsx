import { IconInfoCircle } from '@repo/dfe-icons';
import { Tooltip } from 'antd';

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

const LabelWithHintTooltip = ({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) => {
  return (
    <span className="flex items-center justify-between">
      {label}
      {hint && (
        <Tooltip destroyOnHidden title={hint}>
          <IconInfoCircle />
        </Tooltip>
      )}
    </span>
  );
};

type AdvancedColumnTypeOption = {
  label: React.ReactNode;
  value: string;
  primitive: string;
};

export const ADVANCED_OPTIONS: AdvancedColumnTypeOption[] = [
  // ── Advanced: integers (base type: integer) ──────────────────
  {
    label: <LabelWithHintTooltip label="Int8" hint="Base type: integer" />,
    value: 'Int8',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="Int16" hint="Base type: integer" />,
    value: 'Int16',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="Int32" hint="Base type: integer" />,
    value: 'Int32',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="Int64" hint="Base type: integer" />,
    value: 'Int64',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="Int128" hint="Base type: integer" />,
    value: 'Int128',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="Int256" hint="Base type: integer" />,
    value: 'Int256',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt8" hint="Base type: integer" />,
    value: 'UInt8',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt16" hint="Base type: integer" />,
    value: 'UInt16',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt32" hint="Base type: integer" />,
    value: 'UInt32',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt64" hint="Base type: integer" />,
    value: 'UInt64',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt128" hint="Base type: integer" />,
    value: 'UInt128',
    primitive: 'integer',
  },
  {
    label: <LabelWithHintTooltip label="UInt256" hint="Base type: integer" />,
    value: 'UInt256',
    primitive: 'integer',
  },

  // ── Advanced: floats & decimals (base: float) ──────────────────
  {
    label: <LabelWithHintTooltip label="Float32" hint="Base type: float" />,
    value: 'Float32',
    primitive: 'float',
  },
  {
    label: <LabelWithHintTooltip label="Float64" hint="Base type: float" />,
    value: 'Float64',
    primitive: 'float',
  },
  {
    label: (
      <LabelWithHintTooltip label="Decimal (fixed)" hint="Base type: float" />
    ),
    value: 'Decimal',
    primitive: 'float',
  },
  {
    label: <LabelWithHintTooltip label="Decimal64" hint="Base type: float" />,
    value: 'Decimal64',
    primitive: 'float',
  },

  // ── Advanced: strings (base: string) ─────────────────────────
  {
    label: (
      <LabelWithHintTooltip label="FixedString" hint="Base type: string" />
    ),
    value: 'FixedString',
    primitive: 'string',
  },

  // ── Advanced: dates & times ───────────────────────────────────
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime (legacy)"
        hint="Base type: datetime"
      />
    ),
    value: 'DateTime',
    primitive: 'datetime',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime64 (µs, UTC)"
        hint="Base type: datetime"
      />
    ),
    value: 'DateTime64_6',
    primitive: 'datetime',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime64 (ns, UTC)"
        hint="Base type: datetime"
      />
    ),
    value: 'DateTime64_9',
    primitive: 'datetime',
  },
  {
    label: <LabelWithHintTooltip label="Date32" hint="Base type: date" />,
    value: 'Date32',
    primitive: 'date',
  },

  // ── Advanced: network ─────────────────────────────────────────
  {
    label: <LabelWithHintTooltip label="IPv4" hint="Base type: ip" />,
    value: 'IPv4',
    primitive: 'ip',
  },

  // ── Advanced: geo (base: json — no extra geo primitive) ───────
  {
    label: <LabelWithHintTooltip label="Geo Ring" hint="Base type: json" />,
    value: 'Ring',
    primitive: 'json',
  },
  {
    label: <LabelWithHintTooltip label="Geo Polygon" hint="Base type: json" />,
    value: 'Polygon',
    primitive: 'json',
  },
  {
    label: (
      <LabelWithHintTooltip label="Geo MultiPolygon" hint="Base type: json" />
    ),
    value: 'MultiPolygon',
    primitive: 'json',
  },

  // ── Advanced: semi-structured / CH JSON column ─────────────────
  {
    label: (
      <LabelWithHintTooltip
        label="Dynamic"
        hint="Base type: json (experimental). Semi-structured ClickHouse JSON column."
      />
    ),
    value: 'Dynamic',
    primitive: 'json',
  },

  // ── Advanced: compound (base: json; limited indexing) ───────────
  {
    label: (
      <LabelWithHintTooltip
        label="Array of String"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'ArrayString',
    primitive: 'json',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="Map (String → String)"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'MapStringString',
    primitive: 'json',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="Tuple (String, Int64)"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'Tuple',
    primitive: 'json',
  },
  // ── Advanced: enum width (still use primitive enum + default) ─
  {
    label: <LabelWithHintTooltip label="Enum16" hint="Base type: enum" />,
    value: 'Enum16',
    primitive: 'enum',
  },
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
