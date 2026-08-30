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

const asRules = (block: unknown): TSourceRule[] => {
  if (typeof block !== 'object' || block === null) return [];
  const rules = (block as { source_rules?: unknown }).source_rules;
  if (!Array.isArray(rules)) return [];
  return rules.filter(
    (rule): rule is TSourceRule =>
      typeof rule === 'object' &&
      rule !== null &&
      typeof (rule as TSourceRule).source === 'string',
  );
};

/** Whether this compiler emits per-source rules rather than a whole-app map. */
export const hasSourceRules = (block: unknown): boolean =>
  typeof block === 'object' &&
  block !== null &&
  Array.isArray((block as { source_rules?: unknown }).source_rules);

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
  compiledBlock: unknown,
  deployedBlock: unknown,
  source: string,
): TSourceRoutingState => {
  const compiled =
    asRules(compiledBlock).find((rule) => rule.source === source) ?? null;
  const deployed =
    asRules(deployedBlock).find((rule) => rule.source === source) ?? null;

  return { compiled, deployed, drift: !sameRule(compiled, deployed) };
};
