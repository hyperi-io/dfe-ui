import { describe, expect, it } from 'vitest';
import { loginFailureText } from './LocalLoginForm';

describe('loginFailureText', () => {
  it.each([
    [
      'a wrong password',
      'CredentialsSignin',
      'Unable to login. Please try again.',
    ],
    ['no reason at all', '', 'Unable to login. Please try again.'],
    [
      'a throttled account',
      'Too many failed attempts; try again in 42 seconds',
      'Too many failed attempts; try again in 42 seconds',
    ],
    [
      'an engine that never answered',
      'The engine did not answer in 120 s',
      'The engine did not answer in 120 s',
    ],
  ])('says the reason for %s', (_case, message, text) => {
    expect(loginFailureText(new Error(message))).toBe(text);
  });
});
