import { describe, expect, test } from 'vitest';
import {
  describeMatch,
  fromApiMatch,
  fromApiRootMatch,
  matchDepth,
  TMatchFormNode,
  toApiMatch,
  toApiRootMatch,
} from './sourceMatch';

const test1 = { field: 'data_stream.dataset', operator: 'equals' as const };

describe('toApiMatch', () => {
  test('a single condition is field, operator and value, nothing more', () => {
    expect(toApiMatch({ ...test1, value: 'cisco_ios.log' })).toStrictEqual({
      ...test1,
      value: 'cisco_ios.log',
    });
  });

  test('an exists condition sends an empty value', () => {
    expect(
      toApiMatch({ field: 'agent.type', operator: 'exists', value: null }),
    ).toStrictEqual({ field: 'agent.type', operator: 'exists', value: '' });
  });

  test('a blank condition still names the default operator', () => {
    expect(toApiMatch({})).toStrictEqual({
      field: '',
      operator: 'equals',
      value: '',
    });
  });

  test('groups nest, and negate travels only where it is true', () => {
    const tree: TMatchFormNode = {
      join: 'any',
      negate: false,
      parts: [
        {
          join: 'all',
          negate: true,
          parts: [{ ...test1, value: 'a', negate: false }],
        },
        { field: 'host', operator: 'starts_with', value: 'fw-', negate: true },
      ],
    };

    expect(toApiMatch(tree)).toStrictEqual({
      any: [
        { all: [{ ...test1, value: 'a' }], negate: true },
        { field: 'host', operator: 'starts_with', value: 'fw-', negate: true },
      ],
    });
  });
});

describe('fromApiMatch', () => {
  test('round-trips a nested match unchanged', () => {
    const match = {
      all: [
        { ...test1, value: 'cisco_ios.log' },
        {
          any: [
            { field: 'agent.type', operator: 'equals' as const, value: 'x' },
            { field: 'host', operator: 'exists' as const, value: '' },
          ],
          negate: true,
        },
      ],
    };

    expect(toApiMatch(fromApiMatch(match))).toStrictEqual(match);
  });

  test('an empty group array reads as the single condition beside it', () => {
    expect(
      fromApiMatch({ ...test1, value: 'v', all: [], any: [] }),
    ).toStrictEqual({ ...test1, value: 'v' });
  });
});

describe('root match', () => {
  const negated = { ...test1, value: 'okta.system', negate: true };

  test('a negated single condition opens as a group of one, so its Not box shows', () => {
    expect(fromApiRootMatch(negated)).toStrictEqual({
      join: 'all',
      parts: [negated],
    });
  });

  test('a negated single condition saves back exactly as it was read', () => {
    expect(toApiRootMatch(fromApiRootMatch(negated))).toStrictEqual(negated);
  });

  test('a plain single condition and a real group pass through unchanged', () => {
    const plain = { ...test1, value: 'cisco_ios.log' };
    expect(fromApiRootMatch(plain)).toStrictEqual(plain);
    expect(toApiRootMatch(fromApiRootMatch(plain))).toStrictEqual(plain);

    const group = { any: [plain, negated] };
    expect(toApiRootMatch(fromApiRootMatch(group))).toStrictEqual(group);
  });

  test('a negated group of one keeps its group, because not all of one is not the part', () => {
    const tree: TMatchFormNode = {
      join: 'all',
      negate: true,
      parts: [{ ...test1, value: 'v' }],
    };
    expect(toApiRootMatch(tree)).toStrictEqual({
      all: [{ ...test1, value: 'v' }],
      negate: true,
    });
  });
});

describe('matchDepth', () => {
  test('counts groups, not conditions', () => {
    expect(matchDepth({ ...test1, value: 'v' })).toBe(0);
    expect(matchDepth({ join: 'all', parts: [{ ...test1 }] })).toBe(1);
    expect(
      matchDepth({
        join: 'all',
        parts: [{ join: 'any', parts: [{ join: 'all', parts: [] }] }],
      }),
    ).toBe(3);
    expect(matchDepth(null)).toBe(0);
  });
});

describe('describeMatch', () => {
  test('reads the way the engine describes a match', () => {
    expect(
      describeMatch({
        all: [
          { ...test1, value: 'cisco_ios.log' },
          {
            field: 'agent.type',
            operator: 'equals',
            value: 'winlogbeat',
            negate: true,
          },
          { field: 'host', operator: 'exists' },
        ],
      }),
    ).toBe(
      '(data_stream.dataset equals cisco_ios.log and not agent.type equals winlogbeat and host exists)',
    );
    expect(
      describeMatch({
        any: [
          { field: 'a', operator: 'not_equals', value: '1' },
          { field: 'b', operator: 'ends_with', value: '2' },
        ],
        negate: true,
      }),
    ).toBe('not (a does not equal 1 or b ends with 2)');
  });
});
