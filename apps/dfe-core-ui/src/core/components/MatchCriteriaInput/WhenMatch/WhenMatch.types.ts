import { GROUP_MODES } from './WhenMatch.helpers';

export type TMatchOperator =
  | 'equals'
  | 'not_equals'
  | 'exists'
  | 'includes'
  | 'starts_with'
  | 'ends_with'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'in'
  | 'always'
  | null
  | undefined;

export type TMatchJoin = 'all' | 'any';

export type TMatchFormNode = {
  field?: string | null;
  operator?: TMatchOperator | null;
  value?: string | null;
  negate?: boolean | null;
  join?: TMatchJoin | null;
  parts?: TMatchFormNode[] | null;
};

export type FieldPath = (string | number)[];

export type GroupMode = (typeof GROUP_MODES)[number]['value'];
