import { ApiError } from '@/core/config/api/client';
import { describe, expect, test } from 'vitest';
import {
  getAliasConflict,
  getOrderConflict,
  getRuleErrors,
  getStaleRevision,
  isMatchNotSampleable,
  isMissingRevision,
} from './ingestErrors';

const refusal = (status: number, body: unknown) =>
  new ApiError(status, 'Refused', body);

describe('getOrderConflict', () => {
  test('reads the blocks the field has now from a 409 order_conflict', () => {
    const error = refusal(409, {
      code: 'order_conflict',
      message: 'send every one of them',
      context: { target: '_source', blocks: ['source.a', 'source.b', 7] },
    });

    expect(getOrderConflict(error)).toEqual({
      message: 'send every one of them',
      blocks: ['source.a', 'source.b'],
    });
  });

  test('is null for a 409 the deploy repo raised, which a reload does not explain', () => {
    expect(
      getOrderConflict(
        refusal(409, { code: 'conflict', message: 'kept moving' }),
      ),
    ).toBeNull();
    expect(getOrderConflict(new Error('network'))).toBeNull();
  });
});

describe('getStaleRevision', () => {
  test('carries the current ETag from a 412', () => {
    const error = refusal(412, {
      code: 'etag_mismatch',
      message: 'If-Match does not match the current ETag',
      context: { etag: '"order-2"' },
    });

    expect(getStaleRevision(error)).toEqual({
      message: 'If-Match does not match the current ETag',
      etag: '"order-2"',
    });
  });

  test('still names a bare 412 a proxy answered with no body', () => {
    expect(getStaleRevision(refusal(412, ''))).toEqual({
      message: 'The revision this page read has changed',
      etag: null,
    });
  });

  test('is null for any other status', () => {
    expect(
      getStaleRevision(refusal(409, { code: 'conflict', message: 'x' })),
    ).toBeNull();
  });
});

describe('isMissingRevision', () => {
  test('is a 428 and nothing else', () => {
    expect(
      isMissingRevision(
        refusal(428, { code: 'precondition_required', message: 'x' }),
      ),
    ).toBe(true);
    expect(isMissingRevision(refusal(412, ''))).toBe(false);
  });
});

describe('getRuleErrors', () => {
  test('returns each refusal with its span from a 422 invalid_rule', () => {
    const error = refusal(422, {
      code: 'invalid_rule',
      message: 'The receiver would refuse this rule',
      errors: [{ field: 'when', message: 'unknown function lower' }],
      context: {
        source: 'okta',
        rule_errors: [
          {
            field: 'when',
            message: 'unknown function lower',
            span: { start: 0, end: 5 },
          },
          { field: 'match', message: 'a group needs a part' },
          { message: 'no field, so not a rule error' },
        ],
      },
    });

    expect(getRuleErrors(error)).toEqual([
      {
        field: 'when',
        message: 'unknown function lower',
        span: { start: 0, end: 5 },
      },
      { field: 'match', message: 'a group needs a part' },
    ]);
  });

  test('is empty for a 422 with another code', () => {
    expect(
      getRuleErrors(
        refusal(422, { code: 'validation_error', message: '1 error' }),
      ),
    ).toEqual([]);
  });
});

describe('getAliasConflict', () => {
  test('names the profile, alias and the source already holding it', () => {
    const error = refusal(409, {
      code: 'alias_conflict',
      message: 'firewall is already cisco-asa under dfe-legacy-2x',
      context: {
        source: 'fortigate',
        conflicting_source: 'cisco-asa',
        profile: 'dfe-legacy-2x',
        alias: 'firewall',
      },
    });

    expect(getAliasConflict(error)).toEqual({
      message: 'firewall is already cisco-asa under dfe-legacy-2x',
      profile: 'dfe-legacy-2x',
      alias: 'firewall',
      conflictingSource: 'cisco-asa',
    });
  });

  test('is null for a match conflict', () => {
    expect(
      getAliasConflict(
        refusal(409, { code: 'match_conflict', message: 'x', context: {} }),
      ),
    ).toBeNull();
  });
});

describe('isMatchNotSampleable', () => {
  test('recognises the preview refusal for a grouped, negated or CEL match', () => {
    expect(
      isMatchNotSampleable(
        refusal(422, {
          code: 'match_not_sampleable',
          message: 'Preview is not available',
          context: { source: 'okta', match: 'when' },
        }),
      ),
    ).toBe(true);
    expect(
      isMatchNotSampleable(
        refusal(422, { code: 'discovery_failed', message: 'x' }),
      ),
    ).toBe(false);
    expect(isMatchNotSampleable(null)).toBe(false);
  });
});
