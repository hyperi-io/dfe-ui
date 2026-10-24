import { components } from '@repo/dfe-engine-types';

type TGeneratedSourceMatch = components['schemas']['SourceMatch'];

/**
 * A source match as the engine reads and writes it.
 *
 * The generated type marks every defaulted member required, but the engine
 * leaves a member at its default out of both the body it stores and the one it
 * answers with, so a single condition is `{field, operator, value}` alone.
 */
export type TSourceMatch = Omit<
  TGeneratedSourceMatch,
  'value' | 'negate' | 'all' | 'any'
> & {
  value?: string;
  negate?: boolean;
  all?: TSourceMatch[];
  any?: TSourceMatch[];
};

export type TMatchOperator = NonNullable<TGeneratedSourceMatch['operator']>;

/** Whether every part of a group must hold, or one of them. */
export type TMatchJoin = 'all' | 'any';

/**
 * One condition, or one group of them, as the source form edits it.
 *
 * A group carries `join` and `parts`, and a condition carries `field`,
 * `operator` and `value`. The root keeps a single condition's paths, so a one-condition
 * source opens on the same three fields it always had.
 */
export type TMatchFormNode = {
  field?: string | null;
  operator?: TMatchOperator | null;
  value?: string | null;
  negate?: boolean | null;
  join?: TMatchJoin | null;
  parts?: TMatchFormNode[] | null;
};

/** The engine's MATCH_NESTING_LIMIT: how deep all and any groups may nest in one match. */
export const MATCH_NESTING_LIMIT = 4;

/** Operators that compare no operand. */
const OPERATORS_WITHOUT_VALUE: ReadonlySet<TMatchOperator> = new Set([
  'exists',
  'always',
]);

export const operatorTakesValue = (operator?: TMatchOperator | null) =>
  !operator || !OPERATORS_WITHOUT_VALUE.has(operator);

export const isMatchGroup = (node?: TMatchFormNode | null): boolean =>
  node?.join === 'all' || node?.join === 'any';

export const emptyCondition = (): TMatchFormNode => ({
  field: '',
  operator: 'equals',
  value: '',
});

/** How many groups nest at and below `node`: 0 for a condition. */
export const matchDepth = (node?: TMatchFormNode | null): number => {
  if (!node || !isMatchGroup(node)) return 0;
  const parts = node.parts ?? [];
  return 1 + Math.max(0, ...parts.map(matchDepth));
};

/**
 * The form's tree as the engine's match.
 *
 * `negate` goes only where it is set, so a single condition sends the same
 * `{field, operator, value}` it always has.
 */
export const toApiMatch = (node: TMatchFormNode): TSourceMatch => {
  const negate = node.negate ? { negate: true } : {};
  if (node.join === 'all' || node.join === 'any') {
    return {
      [node.join]: (node.parts ?? []).map(toApiMatch),
      ...negate,
    };
  }
  return {
    field: node.field ?? '',
    operator: node.operator ?? 'equals',
    value: node.value ?? '',
    ...negate,
  };
};

export const fromApiMatch = (match: TSourceMatch): TMatchFormNode => {
  const negate = match.negate ? { negate: true } : {};
  if (match.all?.length) {
    return { join: 'all', parts: match.all.map(fromApiMatch), ...negate };
  }
  if (match.any?.length) {
    return { join: 'any', parts: match.any.map(fromApiMatch), ...negate };
  }
  return {
    field: match.field ?? '',
    operator: match.operator ?? 'equals',
    value: match.value ?? '',
    ...negate,
  };
};

/** The form's root match: a negated single condition opens as a group of one, where its Not box is. */
export const fromApiRootMatch = (match: TSourceMatch): TMatchFormNode => {
  const node = fromApiMatch(match);
  return !isMatchGroup(node) && node.negate
    ? { join: 'all', parts: [node] }
    : node;
};

/** The engine's match for the form's root: a plain group of one condition saves as that condition. */
export const toApiRootMatch = (node: TMatchFormNode): TSourceMatch => {
  const onlyPart = node.parts?.length === 1 ? node.parts[0] : undefined;
  if (
    isMatchGroup(node) &&
    !node.negate &&
    onlyPart &&
    !isMatchGroup(onlyPart)
  ) {
    return toApiMatch(onlyPart);
  }
  return toApiMatch(node);
};

const OPERATOR_TEXT: Record<TMatchOperator, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  exists: 'exists',
  includes: 'includes',
  starts_with: 'starts with',
  ends_with: 'ends with',
  always: 'always',
};

/** The match as one line of text, worded the way the engine's own describe() reads. */
export const describeMatch = (match: TSourceMatch): string => {
  let text: string;
  if (match.all?.length || match.any?.length) {
    const joiner = match.all?.length ? ' and ' : ' or ';
    const parts = (match.all?.length ? match.all : match.any) ?? [];
    text = `(${parts.map(describeMatch).join(joiner)})`;
  } else if (match.operator === 'always') {
    text = 'always';
  } else if (match.operator === 'exists') {
    text = `${match.field} exists`;
  } else {
    const operator = OPERATOR_TEXT[match.operator ?? 'equals'];
    text = `${match.field} ${operator} ${match.value ?? ''}`;
  }
  return match.negate ? `not ${text}` : text;
};
