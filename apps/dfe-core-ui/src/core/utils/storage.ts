// Storage can be absent (server render) or throw (blocked site data, quota), and no page may fail because of it.
const withLocalStorage = <T>(
  fallback: T,
  operate: (store: Storage) => T,
): T => {
  try {
    // A browser blocking site data throws on reading the property itself.
    const store = typeof window === 'undefined' ? null : window.localStorage;
    return store ? operate(store) : fallback;
  } catch {
    return fallback;
  }
};

/** The stored string, or null when nothing is stored or storage is unusable. */
export const readStorageItem = (key: string): string | null =>
  withLocalStorage<string | null>(null, (store) => store.getItem(key));

/** True when the value reached storage. */
export const writeStorageItem = (key: string, value: string): boolean =>
  withLocalStorage(false, (store) => {
    store.setItem(key, value);
    return true;
  });

/** True when the key is gone from storage. */
export const removeStorageItem = (key: string): boolean =>
  withLocalStorage(false, (store) => {
    store.removeItem(key);
    return true;
  });

/** The stored JSON when it parses and passes `isValid`, otherwise null. */
export const readStorageJson = <T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null => {
  const raw = readStorageItem(key);
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
