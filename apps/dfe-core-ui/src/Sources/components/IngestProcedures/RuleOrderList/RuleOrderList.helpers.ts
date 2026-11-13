import { TRuleBlock } from '@/Sources/hooks/useFetchRuleBlocks/types';

export const sameOrder = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((id, index) => id === right[index]);

export const KIND_LABEL: Record<TRuleBlock['kind'], string> = {
  source: 'Source',
  profile: 'Compatibility profile',
  default: 'Default',
};

export const moveId = (ids: string[], from: number, to: number) => {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
};
