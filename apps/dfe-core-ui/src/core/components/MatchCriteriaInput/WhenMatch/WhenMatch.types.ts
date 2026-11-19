import { components } from '@repo/dfe-engine-types';
import { GROUP_MODES } from './WhenMatch.helpers';

type TGeneratedSourceMatch = components['schemas']['SourceMatch'];

export type TMatchOperator = NonNullable<TGeneratedSourceMatch['operator']>;

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
