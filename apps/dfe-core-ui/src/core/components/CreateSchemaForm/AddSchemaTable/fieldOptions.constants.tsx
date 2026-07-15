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
  chOverride?: string;
};

export const ADVANCED_OPTIONS: AdvancedColumnTypeOption[] = [
  // ── Advanced: integers (base type: integer) ──────────────────
  {
    label: <LabelWithHintTooltip label="Int8" hint="Base type: integer" />,
    value: 'integer:Int8',
    primitive: 'integer',
    chOverride: 'Int8',
  },
  {
    label: <LabelWithHintTooltip label="Int16" hint="Base type: integer" />,
    value: 'integer:Int16',
    primitive: 'integer',
    chOverride: 'Int16',
  },
  {
    label: <LabelWithHintTooltip label="Int32" hint="Base type: integer" />,
    value: 'integer:Int32',
    primitive: 'integer',
    chOverride: 'Int32',
  },
  {
    label: <LabelWithHintTooltip label="Int64" hint="Base type: integer" />,
    value: 'integer:Int64',
    primitive: 'integer',
    chOverride: 'Int64',
  },
  {
    label: <LabelWithHintTooltip label="Int128" hint="Base type: integer" />,
    value: 'integer:Int128',
    primitive: 'integer',
    chOverride: 'Int128',
  },
  {
    label: <LabelWithHintTooltip label="Int256" hint="Base type: integer" />,
    value: 'integer:Int256',
    primitive: 'integer',
    chOverride: 'Int256',
  },
  {
    label: <LabelWithHintTooltip label="UInt8" hint="Base type: integer" />,
    value: 'integer:UInt8',
    primitive: 'integer',
    chOverride: 'UInt8',
  },
  {
    label: <LabelWithHintTooltip label="UInt16" hint="Base type: integer" />,
    value: 'integer:UInt16',
    primitive: 'integer',
    chOverride: 'UInt16',
  },
  {
    label: <LabelWithHintTooltip label="UInt32" hint="Base type: integer" />,
    value: 'integer:UInt32',
    primitive: 'integer',
    chOverride: 'UInt32',
  },
  {
    label: <LabelWithHintTooltip label="UInt64" hint="Base type: integer" />,
    value: 'integer:UInt64',
    primitive: 'integer',
    chOverride: 'UInt64',
  },
  {
    label: <LabelWithHintTooltip label="UInt128" hint="Base type: integer" />,
    value: 'integer:UInt128',
    primitive: 'integer',
    chOverride: 'UInt128',
  },
  {
    label: <LabelWithHintTooltip label="UInt256" hint="Base type: integer" />,
    value: 'integer:UInt256',
    primitive: 'integer',
    chOverride: 'UInt256',
  },

  // ── Advanced: floats & decimals (base: float) ──────────────────
  {
    label: <LabelWithHintTooltip label="Float32" hint="Base type: float" />,
    value: 'float:Float32',
    primitive: 'float',
    chOverride: 'Float32',
  },
  {
    label: <LabelWithHintTooltip label="Float64" hint="Base type: float" />,
    value: 'float:Float64',
    primitive: 'float',
    chOverride: 'Float64',
  },
  {
    label: (
      <LabelWithHintTooltip label="Decimal (fixed)" hint="Base type: float" />
    ),
    value: 'float:Decimal',
    primitive: 'float',
    chOverride: 'Decimal(18, 4)',
  },
  {
    label: <LabelWithHintTooltip label="Decimal64" hint="Base type: float" />,
    value: 'float:Decimal64',
    primitive: 'float',
    chOverride: 'Decimal64(8)',
  },

  // ── Advanced: strings (base: string) ─────────────────────────
  {
    label: (
      <LabelWithHintTooltip label="FixedString" hint="Base type: string" />
    ),
    value: 'string:FixedString',
    primitive: 'string',
    chOverride: 'FixedString(16)',
  },

  // ── Advanced: dates & times ───────────────────────────────────
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime (legacy)"
        hint="Base type: datetime"
      />
    ),
    value: 'datetime:DateTime',
    primitive: 'datetime',
    chOverride: 'DateTime',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime64 (µs, UTC)"
        hint="Base type: datetime"
      />
    ),
    value: 'datetime:DateTime64_6',
    primitive: 'datetime',
    chOverride: "DateTime64(6,'UTC')",
  },
  {
    label: (
      <LabelWithHintTooltip
        label="DateTime64 (ns, UTC)"
        hint="Base type: datetime"
      />
    ),
    value: 'datetime:DateTime64_9',
    primitive: 'datetime',
    chOverride: "DateTime64(9,'UTC')",
  },
  {
    label: <LabelWithHintTooltip label="Date32" hint="Base type: date" />,
    value: 'date:Date32',
    primitive: 'date',
    chOverride: 'Date32',
  },

  // ── Advanced: network ─────────────────────────────────────────
  {
    label: <LabelWithHintTooltip label="IPv4" hint="Base type: ip" />,
    value: 'ip:IPv4',
    primitive: 'ip',
    chOverride: 'IPv4',
  },

  // ── Advanced: geo (base: json — no extra geo primitive) ───────
  {
    label: <LabelWithHintTooltip label="Geo Ring" hint="Base type: json" />,
    value: 'json:Ring',
    primitive: 'json',
    chOverride: 'Ring',
  },
  {
    label: <LabelWithHintTooltip label="Geo Polygon" hint="Base type: json" />,
    value: 'json:Polygon',
    primitive: 'json',
    chOverride: 'Polygon',
  },
  {
    label: (
      <LabelWithHintTooltip label="Geo MultiPolygon" hint="Base type: json" />
    ),
    value: 'json:MultiPolygon',
    primitive: 'json',
    chOverride: 'MultiPolygon',
  },

  // ── Advanced: semi-structured / CH JSON column ─────────────────
  {
    label: (
      <LabelWithHintTooltip
        label="Dynamic"
        hint="Base type: json (experimental). Semi-structured ClickHouse JSON column."
      />
    ),
    value: 'json:Dynamic',
    primitive: 'json',
    chOverride: 'Dynamic',
  },

  // ── Advanced: compound (base: json; limited indexing) ───────────
  {
    label: (
      <LabelWithHintTooltip
        label="Array of String"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'json:ArrayString',
    primitive: 'json',
    chOverride: 'Array(String)',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="Map (String → String)"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'json:MapStringString',
    primitive: 'json',
    chOverride: 'Map(String,String)',
  },
  {
    label: (
      <LabelWithHintTooltip
        label="Tuple (String, Int64)"
        hint="Base type: json. Limited indexing."
      />
    ),
    value: 'json:Tuple',
    primitive: 'json',
    chOverride: 'Tuple(String, Int64)',
  },
  // ── Advanced: enum width (still use primitive enum + default) ─
  {
    label: <LabelWithHintTooltip label="Enum16" hint="Base type: enum" />,
    value: 'enum:Enum16',
    primitive: 'enum',
    chOverride: "Enum16('a'=1,'b'=2)",
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
