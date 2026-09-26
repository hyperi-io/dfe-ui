/** @vitest-environment node */

import type { Account, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { describe, expect, test } from 'vitest';
import { authOptions } from './auth';

const jwt = authOptions.callbacks?.jwt;
const sessionCallback = authOptions.callbacks?.session;

const signIn = (user: Partial<User>) =>
  jwt!({
    token: {} as JWT,
    user: { id: 'admin', ...user } as User,
    account: null as unknown as Account,
  });

describe('the session carries the forced-change flag', () => {
  test('a login on an issued password marks the token', async () => {
    const token = await signIn({
      accessToken: 'engine-jwt',
      passwordChangeRequired: true,
    });

    expect(token.passwordChangeRequired).toBe(true);
  });

  test("a login on the account's own password leaves it clear", async () => {
    const token = await signIn({ accessToken: 'engine-jwt' });

    expect(token.passwordChangeRequired).toBe(false);
  });

  test('a renewed session after the change clears it', async () => {
    const token = await jwt!({
      token: { accessToken: 'old', passwordChangeRequired: true } as JWT,
      user: undefined as unknown as User,
      account: null,
      trigger: 'update',
      session: {
        accessToken: 'new',
        expiresIn: 60,
        passwordChangeRequired: false,
      },
    });

    expect(token.passwordChangeRequired).toBe(false);
    expect(token.accessToken).toBe('new');
  });

  test('a renewal that says nothing about the flag leaves it as it was', async () => {
    const token = await jwt!({
      token: { accessToken: 'old', passwordChangeRequired: true } as JWT,
      user: undefined as unknown as User,
      account: null,
      trigger: 'update',
      session: { accessToken: 'new', expiresIn: 60 },
    });

    expect(token.passwordChangeRequired).toBe(true);
  });

  test("the session exposes the token's flag", async () => {
    const session = await sessionCallback!({
      session: { user: {}, expires: '2099-01-01' } as Session,
      token: { accessToken: 'engine-jwt', passwordChangeRequired: true } as JWT,
      user: undefined as unknown as never,
      newSession: undefined,
      trigger: 'update',
    });

    expect((session as Session).passwordChangeRequired).toBe(true);
  });
});
