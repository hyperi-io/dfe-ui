import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  clearPendingReview,
  pendingReviewStorageKey,
  readPendingReview,
  savePendingReview,
} from './pendingReviewStorage';

const COMMAND =
  'git fetch && git switch main && git merge --no-ff dfe/governance/admin/1a2b3c4d && git push';

describe('pendingReviewStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  test('reads back what was saved, per account', () => {
    savePendingReview('admin', {
      pr_url: null,
      command: COMMAND,
      branch: 'dfe/governance/admin/1a2b3c4d',
    });

    expect(readPendingReview('admin')).toEqual({
      pr_url: null,
      command: COMMAND,
      branch: 'dfe/governance/admin/1a2b3c4d',
    });
    expect(readPendingReview('someone-else')).toBeNull();
  });

  test('writes only the three instruction fields', () => {
    const responseWithMore = {
      command: COMMAND,
      new_password: 'must-never-be-stored',
    };
    savePendingReview('admin', responseWithMore);

    const stored = window.localStorage.getItem(
      pendingReviewStorageKey('admin'),
    );
    expect(stored).not.toContain('must-never-be-stored');
    expect(JSON.parse(stored ?? '{}')).toEqual({
      pr_url: null,
      command: COMMAND,
      branch: null,
    });
  });

  test('clears the account it names', () => {
    savePendingReview('admin', { pr_url: 'https://forge.example/pr/7' });

    clearPendingReview('admin');

    expect(readPendingReview('admin')).toBeNull();
  });

  test.each([
    ['not JSON', '{'],
    ['not an object', '"a string"'],
    ['null', 'null'],
    ['no instruction in it', '{"branch":"dfe/governance/admin/x"}'],
  ])('treats a stored value that is %s as nothing stored', (_, raw) => {
    window.localStorage.setItem(pendingReviewStorageKey('admin'), raw);

    expect(readPendingReview('admin')).toBeNull();
  });

  test('a storage that throws reads as nothing stored and never throws', () => {
    const refuse = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(refuse);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(refuse);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(refuse);

    expect(() =>
      savePendingReview('admin', { command: COMMAND }),
    ).not.toThrow();
    expect(readPendingReview('admin')).toBeNull();
    expect(() => clearPendingReview('admin')).not.toThrow();
  });
});
