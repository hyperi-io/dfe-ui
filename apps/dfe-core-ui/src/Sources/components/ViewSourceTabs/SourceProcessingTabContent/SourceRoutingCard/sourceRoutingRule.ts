/** scalo's native rule test: one test on a field, or `all` of several, and `negate` inverts it. */
export type TRuleMatch = {
  field?: string | null;
  op?: string | null;
  value?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  min?: number | null;
  max?: number | null;
  negate?: boolean;
  all?: TRuleMatch[];
};

/** One row of the receiver's rule set: a test, or a CEL Fast `when`, and the field it sets. */
export type TRuleRow = {
  id: string;
  match?: TRuleMatch | null;
  when?: string | null;
  set: Record<string, unknown>;
};

export type TSourceRoutingState = {
  /** The rows the source definitions compile to for this source. */
  compiled: TRuleRow[];
  /** The rows the deployed overlay actually carries for it. */
  deployed: TRuleRow[];
  /** The overlay disagrees with the sources for THIS source. */
  drift: boolean;
};

const SOURCE_FIELD = '_source';
const SOURCE_ROW_PREFIX = 'source.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// The engine keys each derived block by name, so the receiver's rows arrive as
// compiled.rules.rules, beside the routing, destinations and auth blocks.
const ruleRows = (blocks: unknown): TRuleRow[] | null => {
  if (!isRecord(blocks) || !isRecord(blocks.rules)) return null;
  const rows = blocks.rules.rules;
  return Array.isArray(rows) ? (rows.filter(isRecord) as TRuleRow[]) : null;
};

/** Whether this compiler emits a rule set, rather than a whole-app map such as the loader's. */
export const hasSourceRules = (blocks: unknown): boolean =>
  ruleRows(blocks) !== null;

/**
 * A source's rows are `source.<name>`, or `source.<name>.<n>` where its match
 * compiles to several. Compatibility rows and other sources' rows stay out.
 */
const isRowOf = (row: TRuleRow, source: string) => {
  if (typeof row.id !== 'string' || !isRecord(row.set)) return false;
  if (!(SOURCE_FIELD in row.set)) return false;
  const own = `${SOURCE_ROW_PREFIX}${source}`;
  return (
    row.id === own ||
    (row.id.startsWith(`${own}.`) && /^\d+$/.test(row.id.slice(own.length + 1)))
  );
};

// Key order is the serialiser's, so two sides that agree compare the same text.
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, inner: unknown) =>
    isRecord(inner)
      ? Object.fromEntries(
          Object.entries(inner).sort(([a], [b]) => a.localeCompare(b)),
        )
      : inner,
  );

/**
 * The receiver's rows for ONE source.
 *
 * The receiver is a single deployment carrying every source's rows at once, so
 * its whole rule set belongs on the Components page. What belongs on a source
 * page is that source's own rows out of it - and whether the deployed receiver
 * agrees with what the source definition now says.
 */
export const sourceRoutingRule = (
  compiledBlocks: unknown,
  deployedBlocks: unknown,
  source: string,
): TSourceRoutingState => {
  const compiled = (ruleRows(compiledBlocks) ?? []).filter((row) =>
    isRowOf(row, source),
  );
  const deployed = (ruleRows(deployedBlocks) ?? []).filter((row) =>
    isRowOf(row, source),
  );

  return {
    compiled,
    deployed,
    drift: canonical(compiled) !== canonical(deployed),
  };
};
