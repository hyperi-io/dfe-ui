export type TSourceRule = {
  field: string;
  mode: string;
  match_value?: string | null;
  source: string;
};

export type TSourceRoutingState = {
  /** What the source definitions say the rule should be. */
  compiled: TSourceRule | null;
  /** What the deployed overlay actually carries. */
  deployed: TSourceRule | null;
  /** The overlay disagrees with the sources for THIS source. */
  drift: boolean;
};

// The engine keys each derived block by name, so the receiver's rules arrive as
// compiled.routing.source_rules with a sibling compiled.destinations block.
const asBlocks = (blocks: unknown): unknown[] =>
  typeof blocks === 'object' && blocks !== null
    ? Object.values(blocks as Record<string, unknown>)
    : [];

const ruleList = (block: unknown): unknown[] | null => {
  if (typeof block !== 'object' || block === null) return null;
  const rules = (block as { source_rules?: unknown }).source_rules;
  return Array.isArray(rules) ? rules : null;
};

const isSourceRule = (rule: unknown): rule is TSourceRule =>
  typeof rule === 'object' &&
  rule !== null &&
  typeof (rule as TSourceRule).source === 'string';

const asRules = (blocks: unknown): TSourceRule[] =>
  asBlocks(blocks)
    .flatMap((block) => ruleList(block) ?? [])
    .filter(isSourceRule);

/** Whether this compiler emits per-source rules rather than a whole-app map. */
export const hasSourceRules = (blocks: unknown): boolean =>
  asBlocks(blocks).some((block) => ruleList(block) !== null);

const sameRule = (left: TSourceRule | null, right: TSourceRule | null) => {
  if (left === null || right === null) return left === right;
  return (
    left.field === right.field &&
    left.mode === right.mode &&
    (left.match_value ?? null) === (right.match_value ?? null)
  );
};

/**
 * The receiver's routing rule for ONE source.
 *
 * The receiver is a single deployment carrying every source's rule at once, so
 * its whole routing block belongs on the Components page. What belongs on a
 * source page is that source's own row out of it - and whether the deployed
 * receiver agrees with what the source definition now says.
 */
export const sourceRoutingRule = (
  compiledBlocks: unknown,
  deployedBlocks: unknown,
  source: string,
): TSourceRoutingState => {
  const compiled =
    asRules(compiledBlocks).find((rule) => rule.source === source) ?? null;
  const deployed =
    asRules(deployedBlocks).find((rule) => rule.source === source) ?? null;

  return { compiled, deployed, drift: !sameRule(compiled, deployed) };
};
