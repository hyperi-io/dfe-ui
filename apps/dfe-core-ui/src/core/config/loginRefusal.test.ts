import { describe, expect, test } from 'vitest';
import { loginRefusal } from './loginRefusal';
import { readRefusalFragment } from './oidcToken.constants';

describe('loginRefusal', () => {
  test.each([
    ['no_role_granted', 'No access to DFE yet'],
    ['account_disabled', 'Account disabled'],
    ['account_blocked', 'Account blocked'],
    ['service_unavailable', 'Sign-in not recorded'],
    ['unauthorized', 'Sign-in failed'],
  ])('the engine code %j reads as %j', (code, title) => {
    expect(loginRefusal(code).title).toBe(title);
  });

  test('a user with no role is told who can fix it and how to switch account', () => {
    const { description } = loginRefusal('no_role_granted');
    expect(description).toMatch(/Ask a DFE administrator to link one/);
    expect(description).toMatch(/sign out of your identity provider first/);
  });

  test.each(['', 'anything-else', 'constructor', '__proto__', 'toString'])(
    'a code of %j gets the general failure, so a link cannot pick the words',
    (code) => {
      expect(loginRefusal(code)).toEqual(loginRefusal('unauthorized'));
    },
  );
});

describe('readRefusalFragment', () => {
  test.each([
    ['#error=no_role_granted&provider=dex', 'no_role_granted'],
    ['error=account_blocked', 'account_blocked'],
    ['#access_token=engine-jwt&token_type=bearer', null],
    ['#error=', null],
    ['', null],
  ])('%j holds the refusal %j', (hash, code) => {
    expect(readRefusalFragment(hash)).toBe(code);
  });
});
