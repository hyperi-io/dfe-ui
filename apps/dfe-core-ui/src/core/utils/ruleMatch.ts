import { isMatchGroup } from '@/core/components/MatchCriteriaInput/WhenMatch/WhenMatch.helpers';
import { TMatchFormNode } from '@/core/components/MatchCriteriaInput/WhenMatch/WhenMatch.types';
import { components } from '@repo/dfe-engine-types';

export type TRuleCondition = components['schemas']['RuleCondition'];

const ruleOperator = (
  operator: TMatchFormNode['operator'],
): TRuleCondition['operator'] =>
  operator && operator !== 'always' ? operator : 'equals';

/** The form tree as the rule API's match. `negate` is always a boolean. */
export const toApiMatch = (node: TMatchFormNode): TRuleCondition => {
  const negate = !!node.negate;
  if (node.join === 'all' || node.join === 'any') {
    return {
      negate,
      [node.join]: (node.parts ?? []).map(toApiMatch),
    };
  }
  return {
    negate,
    field: node.field ?? '',
    operator: ruleOperator(node.operator),
    value: node.value ?? '',
  };
};

/** A plain group of one condition saves as that condition. */
export const toApiRootMatch = (node: TMatchFormNode): TRuleCondition => {
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

const matchValue = (value: TRuleCondition['value']): string => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(String).join(', ');
  return String(value);
};

/** The rule API's match as the form's tree. */
export const fromApiMatch = (match: TRuleCondition): TMatchFormNode => {
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
    value: matchValue(match.value),
    ...negate,
  };
};

/** A negated single condition opens as a group of one, where its Not box is. */
export const fromApiRootMatch = (match: TRuleCondition): TMatchFormNode => {
  const node = fromApiMatch(match);
  return !isMatchGroup(node) && node.negate
    ? { join: 'all', parts: [node] }
    : node;
};
