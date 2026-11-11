import { describe, expect, it } from 'vitest';
import { buildFormSchema } from './EditSystemDefaultsForm';

const values = (ttl_days: number) => ({
  ttl_days,
  engine: 'MergeTree',
  common_header_type: 'common-header/timeseries',
  common_header_version: '1.0.3',
});

describe('buildFormSchema', () => {
  it.each([
    [0, true],
    [365, true],
    [1000, true],
    [36500, true],
    [36501, false],
    [-1, false],
  ])(
    'retention of %i days against a maximum of 36500 is valid: %s',
    (days, ok) => {
      expect(buildFormSchema(36500).safeParse(values(days)).success).toBe(ok);
    },
  );

  it('takes the bound it is given, not one of its own', () => {
    expect(buildFormSchema(30).safeParse(values(31)).success).toBe(false);
    expect(buildFormSchema(30).safeParse(values(30)).success).toBe(true);
  });
});
