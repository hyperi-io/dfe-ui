import { ApiError } from '@/core/config/api/client';
import { describe, expect, test } from 'vitest';
import {
  getHeldOrgIds,
  getRefusedOrgIdMessages,
  isOrgIdsRefusal,
  TENANT_ID_HELD_CODE,
} from './orgIdRefusals';

const refusal = (status: number, body: unknown) =>
  new ApiError(status, 'refused', body);

const validation = (errors: { field: string; code?: string }[]) =>
  refusal(422, {
    code: 'validation_error',
    message: `${errors.length} validation error(s)`,
    errors: errors.map((e) => ({ message: 'engine words', ...e })),
  });

describe('getHeldOrgIds', () => {
  test('reads every held entry, a null branch as main', () => {
    const error = refusal(409, {
      code: TENANT_ID_HELD_CODE,
      message: 'held',
      context: {
        held: [
          { hunt: 'a', org: 'x', tenant_ids: ['t1'], branch: null },
          { hunt: 'b', org: 'y', tenant_ids: ['t2', 't3'], branch: 'review/b' },
        ],
      },
    });

    expect(getHeldOrgIds(error)).toEqual([
      { hunt: 'a', org: 'x', orgIds: ['t1'], branch: '' },
      { hunt: 'b', org: 'y', orgIds: ['t2', 't3'], branch: 'review/b' },
    ]);
  });

  test('drops an entry missing what the console shows', () => {
    const error = refusal(409, {
      code: TENANT_ID_HELD_CODE,
      message: 'held',
      context: {
        held: [
          { hunt: 'a', org: 'x', tenant_ids: 't1' },
          { org: 'x', tenant_ids: ['t1'] },
          null,
          'a',
        ],
      },
    });

    expect(getHeldOrgIds(error)).toEqual([]);
  });

  test.each([
    ['another code', refusal(409, { code: 'conflict', message: 'taken' })],
    [
      'no context',
      refusal(409, { code: TENANT_ID_HELD_CODE, message: 'held' }),
    ],
    ['a plain error', new Error('offline')],
    ['no error', null],
  ])('is empty for %s', (_, error) => {
    expect(getHeldOrgIds(error)).toEqual([]);
  });
});

describe('isOrgIdsRefusal', () => {
  test('holds when every refused field is an organisation ID', () => {
    expect(
      isOrgIdsRefusal(
        validation([{ field: 'org_ids.0' }, { field: 'org_ids' }]),
      ),
    ).toBe(true);
  });

  test.each([
    [
      'another field too',
      validation([{ field: 'org_ids.0' }, { field: 'name' }]),
    ],
    ['no field detail', refusal(422, { code: 'unknown_org', message: 'gone' })],
    ['a lookalike field', validation([{ field: 'org_ids_extra' }])],
    ['no error', null],
  ])('does not hold with %s', (_, error) => {
    expect(isOrgIdsRefusal(error)).toBe(false);
  });
});

describe('getRefusedOrgIdMessages', () => {
  test('words a pattern refusal by the ID it names', () => {
    const error = validation([
      { field: 'org_ids.0', code: 'string_pattern_mismatch' },
    ]);

    expect(getRefusedOrgIdMessages(error, [' acme'])).toEqual([
      'Organisation ID " acme" may not be blank, hold a comma or a control character such as a tab, or start or end with a space',
    ]);
  });

  test('keeps the engine words when it cannot name the ID', () => {
    const error = validation([
      { field: 'org_ids.5', code: 'string_pattern_mismatch' },
      { field: 'org_ids', code: 'list_type' },
    ]);

    expect(getRefusedOrgIdMessages(error, ['acme'])).toEqual([
      'engine words',
      'engine words',
    ]);
  });

  test('leaves out every other field', () => {
    expect(
      getRefusedOrgIdMessages(validation([{ field: 'name' }]), ['acme']),
    ).toEqual([]);
  });
});
