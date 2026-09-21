import { describe, expect, test } from 'vitest';
import { getAccountDisplayName } from './account.helpers';

const OIDC_SUBJECT = '00u15mxs3ecygt7oj698';

describe('account.helpers', () => {
  describe('.getAccountDisplayName', () => {
    test('prefers the name over the email and username', () => {
      expect(
        getAccountDisplayName({
          name: 'DFE dfe-test',
          email: 'dfe-test@dfe-oidc.test',
          username: OIDC_SUBJECT,
        }),
      ).toBe('DFE dfe-test');
    });

    test('falls back to the email when the name is empty or whitespace', () => {
      expect(
        getAccountDisplayName({
          name: '',
          email: 'dfe-test@dfe-oidc.test',
          username: OIDC_SUBJECT,
        }),
      ).toBe('dfe-test@dfe-oidc.test');
      expect(
        getAccountDisplayName({
          name: '   ',
          email: 'dfe-test@dfe-oidc.test',
          username: OIDC_SUBJECT,
        }),
      ).toBe('dfe-test@dfe-oidc.test');
    });

    test('falls back to the username when name and email are empty or whitespace', () => {
      expect(
        getAccountDisplayName({ name: '', email: '', username: 'admin' }),
      ).toBe('admin');
      expect(
        getAccountDisplayName({ name: ' ', email: '\t ', username: 'admin' }),
      ).toBe('admin');
    });

    test('falls back to the username when name and email are missing', () => {
      expect(
        getAccountDisplayName({ name: null, email: null, username: 'admin' }),
      ).toBe('admin');
      expect(getAccountDisplayName({ username: 'admin' })).toBe('admin');
    });

    test('trims surrounding whitespace from the name and email', () => {
      expect(
        getAccountDisplayName({
          name: '  DFE dfe-test  ',
          username: OIDC_SUBJECT,
        }),
      ).toBe('DFE dfe-test');
      expect(
        getAccountDisplayName({
          email: ' dfe-test@dfe-oidc.test ',
          username: OIDC_SUBJECT,
        }),
      ).toBe('dfe-test@dfe-oidc.test');
    });
  });
});
