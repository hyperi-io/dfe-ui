import { MATCH_OPERATORS } from '@repo/dfe-engine-types/limits';
import { GroupMode, TMatchFormNode, TMatchOperator } from './WhenMatch.types';

export const isMatchGroup = (node?: TMatchFormNode | null): boolean =>
  node?.join === 'all' || node?.join === 'any';

export const emptyCondition = (): TMatchFormNode => ({
  field: '',
  operator: 'equals',
  value: '',
});

/** Operators that compare no operand. */
const OPERATORS_WITHOUT_VALUE: ReadonlySet<TMatchOperator> = new Set([
  'exists',
  'always',
]);

export const operatorTakesValue = (operator?: TMatchOperator | null) =>
  !operator || !OPERATORS_WITHOUT_VALUE.has(operator);

export const OPERATOR_OPTIONS = MATCH_OPERATORS.map((operator) => ({
  label: operator,
  value: operator,
}));

export const GROUP_MODES = [
  { value: 'all', label: 'all', join: 'all', negate: false },
  { value: 'any', label: 'any', join: 'any', negate: false },
  { value: 'none', label: 'none', join: 'any', negate: true },
  { value: 'not-all', label: 'not all', join: 'all', negate: true },
] as const;

export const groupModeOf = (node: TMatchFormNode): GroupMode =>
  GROUP_MODES.find(
    (mode) => mode.join === node.join && mode.negate === !!node.negate,
  )?.value ?? 'all';
