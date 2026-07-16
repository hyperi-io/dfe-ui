import { describe, expect, test } from 'vitest';
import {
  getInitialAdvancedOptions,
  getInitialOverrideType,
  transformOverride,
  validateOverride,
} from './TypeOverrideSelect.helpers';

describe('validateOverride', () => {
  test('returns null when override is null or empty', () => {
    expect(validateOverride(null, {})).toBeNull();
    expect(validateOverride('', {})).toBeNull();
  });

  test('returns null for overrides that need no params', () => {
    expect(validateOverride('Int64', {})).toBeNull();
    expect(validateOverride('IPv4', {})).toBeNull();
  });

  test('requires precision and scale for Decimal', () => {
    expect(validateOverride('Decimal', {})).toBe(
      'Precision and scale are required',
    );
    expect(validateOverride('Decimal', { precision: 10 })).toBe(
      'Precision and scale are required',
    );
    expect(validateOverride('Decimal', { scale: 2 })).toBe(
      'Precision and scale are required',
    );
    expect(validateOverride('Decimal', { precision: 10, scale: 2 })).toBeNull();
  });

  test('requires scale for Decimal64', () => {
    expect(validateOverride('Decimal64', {})).toBe('Scale is required');
    expect(validateOverride('Decimal64', { scale: 4 })).toBeNull();
  });

  test('requires precision for DateTime64', () => {
    expect(validateOverride('DateTime64', {})).toBe('Precision is required');
    expect(validateOverride('DateTime64', { precision: 3 })).toBeNull();
  });

  test('requires length for FixedString', () => {
    expect(validateOverride('FixedString', {})).toBe('Length is required');
    expect(validateOverride('FixedString', { length: 16 })).toBeNull();
  });

  test('requires values for Enum16', () => {
    expect(validateOverride('Enum16', {})).toBe('Values are required');
    expect(
      validateOverride('Enum16', { values: "'a' = 1, 'b' = 2" }),
    ).toBeNull();
  });
});

describe('transformOverride', () => {
  test('returns null when override type is null or empty', () => {
    expect(transformOverride(null, {})).toBeNull();
    expect(transformOverride('', {})).toBeNull();
  });

  test('returns the override type when no transformFunction exists', () => {
    expect(transformOverride('Int64', {})).toBe('Int64');
  });

  test('returns null for unknown override types', () => {
    expect(transformOverride('NotARealType', {})).toBeNull();
  });

  test('applies Decimal transform', () => {
    expect(transformOverride('Decimal', { precision: 10, scale: 2 })).toBe(
      'Decimal(10,2)',
    );
  });

  test('applies Decimal64 transform', () => {
    expect(transformOverride('Decimal64', { scale: 4 })).toBe('Decimal64(4)');
  });

  test('applies FixedString transform', () => {
    expect(transformOverride('FixedString', { length: 32 })).toBe(
      'FixedString(32)',
    );
  });

  test('applies DateTime64 transform', () => {
    expect(transformOverride('DateTime64', { precision: 3 })).toBe(
      "DateTime64(3,'UTC')",
    );
  });

  test('applies Enum16 transform', () => {
    expect(transformOverride('Enum16', { values: "'ok' = 1, 'err' = 2" })).toBe(
      "Enum16('ok' = 1, 'err' = 2)",
    );
  });
});

describe('getInitialOverrideType', () => {
  test('returns null for null or empty values', () => {
    expect(getInitialOverrideType(null)).toBeNull();
    expect(getInitialOverrideType('')).toBeNull();
  });

  test('returns the bare type when there are no params', () => {
    expect(getInitialOverrideType('Int64')).toBe('Int64');
  });

  test('strips parenthetical params', () => {
    expect(getInitialOverrideType('Decimal(10, 2)')).toBe('Decimal');
    expect(getInitialOverrideType('Decimal64(4)')).toBe('Decimal64');
    expect(getInitialOverrideType("DateTime64(3, 'UTC')")).toBe('DateTime64');
    expect(getInitialOverrideType('FixedString(16)')).toBe('FixedString');
  });

  test('trims whitespace around the type name', () => {
    expect(getInitialOverrideType('  Decimal64 (4)')).toBe('Decimal64');
  });
});

describe('getInitialAdvancedOptions', () => {
  test('returns empty object for null or empty values', () => {
    expect(getInitialAdvancedOptions(null)).toEqual({});
    expect(getInitialAdvancedOptions('')).toEqual({});
  });

  test('returns empty object for overrides without params', () => {
    expect(getInitialAdvancedOptions('Int64')).toEqual({});
  });

  test('parses Decimal precision and scale', () => {
    expect(getInitialAdvancedOptions('Decimal(18, 4)')).toEqual({
      precision: 18,
      scale: 4,
    });
  });

  test('parses Decimal64 scale', () => {
    expect(getInitialAdvancedOptions('Decimal64(6)')).toEqual({ scale: 6 });
  });

  test('parses DateTime64 precision from the first arg', () => {
    expect(getInitialAdvancedOptions("DateTime64(3, 'UTC')")).toEqual({
      precision: 3,
    });
  });

  test('parses FixedString length', () => {
    expect(getInitialAdvancedOptions('FixedString(64)')).toEqual({
      length: 64,
    });
  });

  test('parses Enum16 values string', () => {
    expect(getInitialAdvancedOptions("Enum16('a' = 1, 'b' = 2)")).toEqual({
      values: "'a' = 1, 'b' = 2",
    });
  });

  test('defaults missing numeric params to 0', () => {
    expect(getInitialAdvancedOptions('Decimal()')).toEqual({
      precision: 0,
      scale: 0,
    });
    expect(getInitialAdvancedOptions('FixedString()')).toEqual({ length: 0 });
  });
});
