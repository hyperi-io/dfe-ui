import { describe, expect, test } from 'vitest';
import { hasOverrides } from './defaultSection.helpers';

const defaults = {
  default_header_type: 'common',
  default_header_version: '1.0',
  default_ttl_days: 90,
  default_engine: 'MergeTree',
};

describe('hasOverrides', () => {
  test('is false when defaults have not loaded yet', () => {
    expect(
      hasOverrides({
        formValues: {
          header: { type: 'custom', version: '2.0' },
          schema: { ttl_days: 7, engine: 'ReplacingMergeTree' },
        },
        defaults: null,
      }),
    ).toBe(false);
  });

  test('is false when form fields are empty (new source using system defaults)', () => {
    expect(
      hasOverrides({
        formValues: {},
        defaults,
      }),
    ).toBe(false);
  });

  test('is false when form values match system defaults', () => {
    expect(
      hasOverrides({
        formValues: {
          header: { type: 'common', version: '1.0' },
          schema: { ttl_days: 90, engine: 'MergeTree' },
        },
        defaults,
      }),
    ).toBe(false);
  });

  test('is true when any form value differs from system defaults', () => {
    expect(
      hasOverrides({
        formValues: {
          header: { type: 'common', version: '1.0' },
          schema: { ttl_days: 7, engine: 'MergeTree' },
        },
        defaults,
      }),
    ).toBe(true);
  });

  test('compares ttl_days by value, not type', () => {
    expect(
      hasOverrides({
        formValues: {
          header: { type: 'common', version: '1.0' },
          schema: { ttl_days: 90, engine: 'MergeTree' },
        },
        defaults: { ...defaults, default_ttl_days: 90 },
      }),
    ).toBe(false);
  });
});
