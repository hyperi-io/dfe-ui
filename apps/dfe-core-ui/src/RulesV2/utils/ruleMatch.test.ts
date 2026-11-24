import { describe, expect, test } from 'vitest';
import { fromApiRootMatch, toApiMatch, toApiRootMatch } from './ruleMatch';

describe('toApiMatch', () => {
  test('a condition always sends negate as a boolean', () => {
    expect(
      toApiMatch({ field: 'host', operator: 'equals', value: 'a' }),
    ).toStrictEqual({
      field: 'host',
      operator: 'equals',
      value: 'a',
      negate: false,
    });
  });

  test('a group is all or any, and negate is true only when set', () => {
    expect(
      toApiMatch({
        join: 'any',
        negate: true,
        parts: [{ field: 'host', operator: 'equals', value: 'a' }],
      }),
    ).toStrictEqual({
      negate: true,
      any: [{ field: 'host', operator: 'equals', value: 'a', negate: false }],
    });
  });

  test('a plain group of one condition saves as that condition', () => {
    expect(
      toApiRootMatch({
        join: 'all',
        parts: [{ field: 'host', operator: 'equals', value: 'a' }],
      }),
    ).toStrictEqual({
      field: 'host',
      operator: 'equals',
      value: 'a',
      negate: false,
    });
  });
});

describe('fromApiRootMatch', () => {
  test('a negated condition opens as a group of one', () => {
    expect(
      fromApiRootMatch({
        field: 'host',
        operator: 'equals',
        value: 'a',
        negate: true,
      }),
    ).toStrictEqual({
      join: 'all',
      parts: [{ field: 'host', operator: 'equals', value: 'a', negate: true }],
    });
  });
});
