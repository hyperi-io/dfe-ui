import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  consumeOidcLoginNonce,
  createOidcLoginNonce,
  rememberOidcLoginNonce,
} from './oidcLoginNonce';

const NOW = 1_800_000_000_000;

describe('OIDC login nonce', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('is 128 random bits and never repeats', () => {
    const first = createOidcLoginNonce();

    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(createOidcLoginNonce()).not.toBe(first);
  });

  test('accepts the nonce this tab stored', () => {
    rememberOidcLoginNonce('abc', NOW);

    expect(consumeOidcLoginNonce('abc', NOW + 1000)).toBe(true);
  });

  test('refuses a link when this tab started no login, which is what a planted link looks like', () => {
    expect(consumeOidcLoginNonce('attacker-chosen', NOW)).toBe(false);
  });

  test('refuses a nonce other than the stored one', () => {
    rememberOidcLoginNonce('abc', NOW);

    expect(consumeOidcLoginNonce('abd', NOW)).toBe(false);
  });

  test('refuses a missing nonce even when one is stored', () => {
    rememberOidcLoginNonce('abc', NOW);

    expect(consumeOidcLoginNonce(undefined, NOW)).toBe(false);
  });

  test('is single-use: a replay of the same link is refused', () => {
    rememberOidcLoginNonce('abc', NOW);
    consumeOidcLoginNonce('abc', NOW);

    expect(consumeOidcLoginNonce('abc', NOW)).toBe(false);
  });

  test('a failed check still spends the stored nonce', () => {
    rememberOidcLoginNonce('abc', NOW);
    consumeOidcLoginNonce('wrong', NOW);

    expect(consumeOidcLoginNonce('abc', NOW)).toBe(false);
  });

  test('lapses after ten minutes', () => {
    rememberOidcLoginNonce('abc', NOW);

    expect(consumeOidcLoginNonce('abc', NOW + 10 * 60 * 1000 + 1)).toBe(false);
  });

  test('refuses a stored value that is not the shape it writes', () => {
    window.sessionStorage.setItem('dfe.oidcLoginNonce', 'not json');

    expect(consumeOidcLoginNonce('not json', NOW)).toBe(false);
  });

  test('reports a refused write, and a blocked read refuses the login', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException(
        'The quota has been exceeded.',
        'QuotaExceededError',
      );
    });

    expect(rememberOidcLoginNonce('abc', NOW)).toBe(false);
    expect(consumeOidcLoginNonce('abc', NOW)).toBe(false);
  });
});
