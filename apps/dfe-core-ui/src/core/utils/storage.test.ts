import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  readStorageItem,
  readStorageJson,
  removeStorageItem,
  writeStorageItem,
} from './storage';

const KEY = 'storage-test-key';

const isList = (value: unknown): value is unknown[] => Array.isArray(value);

const refuse = () => {
  throw new DOMException('The operation is insecure.', 'SecurityError');
};

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  test('reads back what was written', () => {
    expect(writeStorageItem(KEY, 'dark')).toBe(true);

    expect(readStorageItem(KEY)).toBe('dark');
    expect(window.localStorage.getItem(KEY)).toBe('dark');
  });

  test('reads a key that was never written as null', () => {
    expect(readStorageItem(KEY)).toBeNull();
  });

  test('removes the key it names', () => {
    window.localStorage.setItem(KEY, 'dark');
    window.localStorage.setItem('other-key', 'kept');

    expect(removeStorageItem(KEY)).toBe(true);

    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(window.localStorage.getItem('other-key')).toBe('kept');
  });

  test('a storage that throws on read reads as nothing stored', () => {
    window.localStorage.setItem(KEY, 'dark');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(refuse);

    expect(readStorageItem(KEY)).toBeNull();
    expect(readStorageJson(KEY, isList)).toBeNull();
  });

  test('a storage that throws on write reports it unsaved and never throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException(
        'The quota has been exceeded.',
        'QuotaExceededError',
      );
    });

    expect(writeStorageItem(KEY, 'dark')).toBe(false);
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  test('a storage that throws on remove reports it not removed and never throws', () => {
    window.localStorage.setItem(KEY, 'dark');
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(refuse);

    expect(removeStorageItem(KEY)).toBe(false);
    expect(window.localStorage.getItem(KEY)).toBe('dark');
  });

  test('a browser that blocks the storage property itself gets every fallback', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(refuse);

    expect(readStorageItem(KEY)).toBeNull();
    expect(writeStorageItem(KEY, 'dark')).toBe(false);
    expect(removeStorageItem(KEY)).toBe(false);
    expect(readStorageJson(KEY, isList)).toBeNull();
  });

  test('a browser with no storage object gets every fallback', () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(
      null as unknown as Storage,
    );

    expect(readStorageItem(KEY)).toBeNull();
    expect(writeStorageItem(KEY, 'dark')).toBe(false);
    expect(removeStorageItem(KEY)).toBe(false);
    expect(readStorageJson(KEY, isList)).toBeNull();
  });

  test('a server render, with no window at all, gets every fallback', () => {
    vi.stubGlobal('window', undefined);

    expect(readStorageItem(KEY)).toBeNull();
    expect(writeStorageItem(KEY, 'dark')).toBe(false);
    expect(removeStorageItem(KEY)).toBe(false);
    expect(readStorageJson(KEY, isList)).toBeNull();
  });

  describe('readStorageJson', () => {
    test('returns the parsed value when it passes the check', () => {
      window.localStorage.setItem(KEY, '["NEW_VIEW"]');

      expect(readStorageJson(KEY, isList)).toEqual(['NEW_VIEW']);
    });

    test('reads a key that was never written as null', () => {
      expect(readStorageJson(KEY, isList)).toBeNull();
    });

    test.each([
      ['not JSON', '{'],
      ['empty', ''],
      ['a number', '5'],
      ['null', 'null'],
      ['an object', '{"NEW_VIEW":true}'],
      ['a string', '"NEW_VIEW"'],
    ])('reads a stored value that is %s as null', (_, raw) => {
      window.localStorage.setItem(KEY, raw);

      expect(readStorageJson(KEY, isList)).toBeNull();
    });
  });
});
