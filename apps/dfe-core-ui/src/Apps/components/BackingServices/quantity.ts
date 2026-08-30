const SUFFIXES: Record<string, number> = {
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  K: 1000,
  M: 1000 ** 2,
  G: 1000 ** 3,
  T: 1000 ** 4,
};

/**
 * A Kubernetes memory quantity in bytes, or null when it cannot be read.
 *
 * Null rather than a guess: an unparseable value must not be compared, because
 * a wrong comparison here decides whether an operator is warned about an OOM.
 */
export const parseMemoryQuantity = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const match = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|K|M|G|T)?$/.exec(value.trim());
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  return amount * (match[2] ? SUFFIXES[match[2]] : 1);
};

/**
 * Whether a memory value is being lowered.
 *
 * Unknown when either side cannot be read, which is not the same as "no" - the
 * caller must not treat it as a cleared decrease.
 */
export const isMemoryDecrease = (
  current: unknown,
  next: unknown,
): boolean | null => {
  const from = parseMemoryQuantity(current);
  const to = parseMemoryQuantity(next);
  if (from === null || to === null) return null;
  return to < from;
};
