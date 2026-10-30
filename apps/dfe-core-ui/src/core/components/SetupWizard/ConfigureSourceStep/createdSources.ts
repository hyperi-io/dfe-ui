const KEY = 'dfe.setupWizard.createdSourceCount';

let memoryCount: number | null = null;
const listeners = new Set<() => void>();

const parseCount = (raw: string | null): number | null => {
  if (raw === null) return null;
  const count = Number(raw);
  return Number.isInteger(count) && count >= 0 ? count : null;
};

/** Sources created on this step, including after the step unmounts. */
export const getCreatedSourceCount = (): number | null => {
  if (typeof window === 'undefined') return memoryCount;
  try {
    return parseCount(window.sessionStorage.getItem(KEY));
  } catch {
    return memoryCount;
  }
};

export const subscribeCreatedSourceCount = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const rememberCreatedSources = (count: number) => {
  memoryCount = count;
  try {
    window.sessionStorage.setItem(KEY, String(count));
  } catch {
    // Private mode keeps the in-memory count for this visit.
  }
  listeners.forEach((listener) => listener());
};
